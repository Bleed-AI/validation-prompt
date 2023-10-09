import re
import bson
import openai
from exponential_backoff import retry_with_exponential_backoff


# region: LLM UTILS
def get_prompt_info(llm_json):
    prompt_info = ''
    for item in llm_json:
        idd = item['id']
        typ = 'True/False'
        for chk in item['checks']:
            if 'operator' in item:
                idd = chk['sub_id']
            question = chk['option_name']

            prompt_info += f'ID:{idd}: {question} ({typ})\n'
    return prompt_info


@retry_with_exponential_backoff
def completions_with_backoff(**kwargs):
    return openai.ChatCompletion.create(**kwargs)


def relevancy(prompt):
    response = completions_with_backoff(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=512,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
    )
    result = response['choices'][0]['message']['content']
    return result


# endregion


# region: LOGIC UTILS
def range_response(job, val, data_val):
    if data_val in job:
        data_val = job[data_val]
        if data_val:
            if isinstance(data_val, dict) or (data_val.lower() != 'not available'):
                if 'min' in data_val and 'max' in data_val:
                    data_val_min = convert_to_int(data_val['min'])
                    data_val_max = convert_to_int(data_val['max'])
                    data_val = (data_val_min + data_val_max) // 2

                else:
                    data_val = convert_to_int(data_val)

                if 'min' in val and 'max' in val:
                    if val['min'] != 'any' and val['max'] != 'any':
                        lower_bound = float(val['min'])
                        upper_bound = float(val['max'])
                        if lower_bound <= data_val <= upper_bound:
                            return True
                        else:
                            return False

                    elif val['min'] == 'any' and val['max'] != 'any':
                        upper_bound = convert_to_int(val['max'])
                        if data_val < upper_bound:
                            return True
                        else:
                            return False

                    elif val['min'] != 'any' and val['max'] == 'any':
                        lower_bound = float(val['min'])
                        if lower_bound < data_val:
                            return True
                        else:
                            return False
            else:
                return False
    else:
        return False


def value_response(job, val, data_val):
    if data_val in job:
        data_val = str(job[data_val])
        val = str(val)
        if data_val:
            if val == data_val:
                return True
            else:
                return False
    else:
        return False


def clause_response(job, checks):
    results = []
    for check in checks:
        if check['option_type'] == 'value':
            resp = value_response(job, check['option_value'], check['option_name'])
            results.append(resp)
        elif check['option_type'] == 'range':
            resp = range_response(job, check['option_value'], check['option_name'])
            results.append(resp)

    return results


def check_condition(job, item):
    flag_name = None
    checks = item['checks']
    # print("CHECKS", checks)
    # print("JOB", job)
    checks = [check for check in checks if check['option_name'] in job]

    # print("CHECKS", checks)

    if 'operator' in item:
        condition = item['operator']
        if condition == 'AND':
            if item['award_type'] == 'positive' and not item['is_bonus']:
                max_score = item['weight']
            else:
                max_score = 0

            results = clause_response(job, checks)
            print("RESULTS", results)
            result = all(results)
            if result:
                if 'flag_name' in item:
                    flag_name = item['flag_name']
                return item['award_type'], item['weight'], max_score, flag_name
            else:
                return None, 0, max_score, flag_name
        elif condition == 'OR':
            if item['award_type'] == 'positive' and not item['is_bonus']:
                max_score = item['weight']
            else:
                max_score = 0
            results = clause_response(job, checks)
            # print("RESULTS", results)
            result = any(results)
            if result:
                if 'flag_name' in item:
                    flag_name = item['flag_name']
                return item['award_type'], item['weight'], max_score, flag_name
            else:
                return None, 0, max_score, flag_name

    else:
        if item['award_type'] == 'positive' and not item['is_bonus']:
            max_score = item['weight']
        else:
            max_score = 0
        results = clause_response(job, checks)
        result = results[0]
        if result:
            if 'flag_name' in item:
                flag_name = item['flag_name']
            return item['award_type'], item['weight'], max_score, flag_name
        else:
            return None, 0, max_score, flag_name


# endregion


def get_llm_logic_clause(json_data):
    logic_clauses = []
    llm_clauses = []

    for clause in json_data["clauses"]:
        if clause["clause_type"] == "logic":
            logic_clauses.append(clause)
        elif clause["clause_type"] == "llm":
            llm_clauses.append(clause)

    return logic_clauses, llm_clauses


def get_modified_llm_clauses(llm_clauses):
    for obj in llm_clauses:
        if "operator" in obj:
            operator_checks = obj["checks"]
            for i, check in enumerate(operator_checks):
                check["sub_id"] = f"{obj['id']}.{i + 1}"
    return llm_clauses


def get_metadata(llm_clauses, ans):
    metadata = []
    for data in llm_clauses:
        checks = data['checks']
        for chk in checks:
            if 'operator' not in data:
                ans_id = 'ID-' + str(data['id'])
                resp = {"id": data['id'], "Question": chk['option_name'], "Answer": ans[ans_id]['Answer']}
                metadata.append(resp)
                print(data['id'], chk['option_name'], ans[ans_id]['Answer'])
            else:
                ans_id = 'ID-' + str(chk['sub_id'])
                resp = {"id": chk['sub_id'], "Question": chk['option_name'], "Answer": ans[ans_id]['Answer']}
                metadata.append(resp)
                print(chk['sub_id'], chk['option_name'], ans[ans_id]['Answer'])

    return metadata


def get_llm_score(llm_clauses, ans_lst):
    score = {'positive': 0, 'negative': 0, 'flags': []}
    for idd in ans_lst:
        for item in llm_clauses:
            #             print(j)
            if 'operator' not in item:
                llm_id = item['id']
                if float(llm_id) == float(idd):
                    if 'flag_name' in item:
                        flag_name = item['flag_name']
                        score['flags'].append(flag_name)
                    print(idd, item['award_type'], item['weight'])
                    if item['award_type'] == 'positive':
                        score['positive'] += item['weight']
                    else:
                        score['negative'] += item['weight']
            else:
                ids = [float(idd['sub_id']) for idd in item['checks']]
                if item['operator'] == 'OR':
                    if idd in ids:
                        if 'flag_name' in item:
                            flag_name = item['flag_name']
                            score['flags'].append(flag_name)
                        print(idd, item['award_type'], item['weight'])
                        if item['award_type'] == 'positive':
                            score['positive'] += item['weight']
                        else:
                            score['negative'] += item['weight']

                if item['operator'] == 'AND':
                    all_present = all(elem in ans_lst for elem in ids)
                    if all_present:
                        if 'flag_name' in item:
                            flag_name = item['flag_name']
                            score['flags'].append(flag_name)
                        print(idd, item['award_type'], item['weight'])
                        if item['award_type'] == 'positive':
                            score['positive'] += item['weight']
                        else:
                            score['negative'] += item['weight']
    return score

def convert_to_int(str_amount):
    str_amount = str_amount.replace("$", "").replace(",", "")
    if str_amount.endswith("K"):
        num = round(float(str_amount[:-1]) * 1000)
        return num
    else:
        match = re.search(r'\d+(\.\d+)?', str_amount)
        if match:
            num = float(match.group(0))
            return num
        else:
            return None