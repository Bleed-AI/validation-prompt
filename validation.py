import json
from llm_prompt import get_val_prompt
from utils import check_condition, get_llm_logic_clause, get_modified_llm_clauses, \
    get_prompt_info, relevancy, get_metadata, get_llm_score


def validation_run(prompt, job):
    or_job = job.copy()
    client_info = job.pop('client_info', {})
    job_type = job.pop('job_type', {})
    job_interaction = job.pop('job_interaction', {})
    job.update(client_info)
    job.update(job_type)
    job.update(job_interaction)

    # clauses = prompt['clauses']

    job_title = job['title']
    job_description = job['description']
    print("JOB", job)

    logic_clauses, llm_clauses = get_llm_logic_clause(prompt)
    original_llm_clauses = llm_clauses.copy()
    llm_clauses = get_modified_llm_clauses(llm_clauses)

    max_score = 0
    pos_score = 0
    neg_score = 0
    metadata = []
    flags = []

    if logic_clauses:
        for clause in logic_clauses:
            award_type, score, total, flag = check_condition(job, clause)
            if flag:
                flags.append(flag)
            max_score += total if total else 0
            if award_type == 'positive':
                pos_score += score if score else 0
            elif award_type == 'negative':
                neg_score -= score if score else 0

    if llm_clauses:
        prompt_info = get_prompt_info(llm_clauses)
        prompt = get_val_prompt(job_title, job_description, prompt_info)
        # print("Prompt", prompt)
        response = relevancy(prompt)
        ans = json.loads(response)
        metadata = get_metadata(llm_clauses, ans)
        llm_max_score = [llm_data["weight"] for llm_data in llm_clauses if
                         llm_data['award_type'] == 'positive' and llm_data['is_bonus'] == False]
        llm_max_score = sum(llm_max_score) if llm_max_score else 0
        max_score += llm_max_score

        ans_lst = [float(i.split('-')[-1]) for i in ans if str(ans[i]['Answer']) == 'True']
        ans_lst = list(set(x for x in ans_lst))

        llm_score = get_llm_score(llm_clauses, ans_lst)
        pos_score += llm_score['positive']
        neg_score -= llm_score['negative']

        if llm_score['flags']:
            flags.extend(llm_score['flags'])

    total_score = pos_score / max_score * 100
    # or_job['score'] = total_score
    return {'total_score': total_score, 'flags': flags, 'metadata': metadata}
