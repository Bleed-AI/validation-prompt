'use client'
import React, { useState, ChangeEvent } from 'react'
import TextField from '@/components/UI/Textfield/input'
import TextArea from '@/components/UI/Textarea/textarea'
import ToggleButton from '@/components/UI/ToggleButton/toggleButton'
import Button from '@/components/UI/Buttons/button'
import LogicForm from './logicForm'
import LlmForm, { OptionType, LlmFormValues } from './llmForm'
import Dropdown from '@/components/UI/Dropdown/dropdown'
import { internalLinks } from '@/utils/links'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import LlmTable from '../(_components_)/llmTable'
import LogicTable from '../(_components_)/logicTable'
import PromptName from '../(_components_)/promptName'
import JsonModal from '../(_components_)/jsonModal'
import FlagModal from '../(_components_)/flagModal'
import { useAppDispatch } from '@/store/hooks'
import { saveValidationPrompt } from '@/store/validation/validationthunks'

const PromptsForm = () => {
    const token = useAppSelector((state) => state.auth.token)
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [logicForm, setLogicForm] = useState(true)
    const [llmForm, setLlmForm] = useState(false)
    const [bonusChecked, setBonusChecked] = useState(false)
    const [flagChecked, setFlagChecked] = useState(false)
    const [systemPrompt, setSystemPrompt] = useState('')
    const [awardType, setAwardType] = useState('')
    const [weightage, setWeightage] = useState('')
    const [bonus, setBonus] = useState('0')
    const [question, setQuestion] = useState('')
    const [llmFormValues, setLlmFormValues] = useState<LlmFormValues>({
        selectedValue: '',
        minValue: '',
        maxValue: '',
        additionalFieldValue: '',
        optionType: OptionType.RANGE
    })
    const [submittedData, setSubmittedData] = useState<any[]>([])
    const [jsonData, setJsonData] = useState('')
    const [promptName, setPromptName] = useState('')
    const [promptSubmitted, setPromptSubmitted] = useState(false)
    const [flag, setFlag] = useState('')
    const [operator, setOperator] = useState('')

    const systemPromptText =
        'You are an expert Business Development Contractor that understands the AI industry, you’ll be given an Upwork job title and description and you’ll be asked a series of questions. Refer to the provided job description and title to answer each question accurately.'

    const [editableSystemPromptText, setEditableSystemPromptText] = useState(systemPromptText)
    const handleEditableSystemPromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setEditableSystemPromptText(event.target.value)
    }

    const handleLogicButton = () => {
        setLogicForm(true)
        setLlmForm(false)
    }

    const backendValueMap: { [key: string]: string } = {
        'Hourly Pay': 'hourly_range',
        'Total Spent per Hire': 'total_spent_per_hire',
        Ratings: 'rating',
        'Hire Rate': 'hire_rate',
        'Hours Billed': 'hours_billed',
        'Fixed Price': 'fixed_price',
        'Hourly Rate': 'average_hourly_rate',
        Payment: 'payment_method_verification',
        Hours: 'hours_per_week',
        'Job Type': 'job_type',
        'Project Length': 'project_length',
        'Expertise Level': 'expertise_level'
    }

    const frontendValueMap: { [key: string]: string } = {
        hourly_range: 'Hourly Pay',
        total_spent_per_hire: 'Total Spent per Hire',
        rating: 'Ratings',
        hire_rate: 'Hire Rate',
        hours_billed: 'Hours Billed',
        fixed_price: 'Fixed Price',
        average_hourly_rate: 'Hourly Rate',
        payment_method_verification: 'Payment',
        hours_per_week: 'Hours',
        job_type: 'Job Type',
        project_length: 'Project Length',
        expertise_level: 'Expertise Level'
    }

    const handleLLMButton = () => {
        setLogicForm(false)
        setLlmForm(true)
    }

    const handleBonus = (event: ChangeEvent<HTMLInputElement>) => {
        setBonusChecked(event.target.checked)
        setBonus(event.target.checked ? 'True' : 'False')
    }

    const handleFlagChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFlagChecked(event.target.checked)
        setFlag(event.target.checked ? 'red' : 'no')
    }

    const handleDropdownChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setAwardType(event.target.value)
    }

    // const handleSystemPromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    //     setSystemPrompt(event.target.value)
    // }

    const handleWeightageChange = (event: ChangeEvent<HTMLInputElement>) => {
        setWeightage(event.target.value)
    }

    const handleOperatorChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOperator(event.target.value)
    }

    const handleQuestionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(event.target.value)
    }

    const handleLLMFormSubmit = (llmFormValues: LlmFormValues) => {
        const modifiedSelectedValue =
            backendValueMap[llmFormValues.selectedValue] || llmFormValues.selectedValue

        setLlmFormValues({
            ...llmFormValues,
            selectedValue: modifiedSelectedValue
        })
    }

    const handleSubmit = () => {
        let checkData = {}

        if (llmForm) {
            const { selectedValue, minValue, maxValue, optionType, additionalFieldValue } =
                llmFormValues

            if (optionType === OptionType.RANGE) {
                checkData = {
                    option_name: selectedValue,
                    option_type: optionType,
                    option_value: {
                        min: minValue.trim() === '' ? 'any' : minValue.toString(),
                        max: maxValue.trim() === '' ? 'any' : maxValue.toString()
                    }
                }
            } else if (optionType === OptionType.VALUE) {
                checkData = {
                    option_name: selectedValue,
                    option_type: optionType,
                    option_value: additionalFieldValue
                }
            }
        } else {
            checkData = {
                question: question
            }
        }

        const logicFormData = {
            id: submittedData.length + 1,
            system_prompt: systemPromptText,
            clause_type: logicForm ? 'llm' : 'logic',
            award_type: awardType,
            is_bonus: bonusChecked,
            weight: parseInt(weightage, 10),
            flag_name: flag,
            operator: operator,
            check: checkData
        }
        console.log(logicFormData)
        setSubmittedData([...submittedData, logicFormData])
    }

    const handlePromptNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPromptName(event.target.value)
    }

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [flagModal, setFlagModal] = useState(false)
    const handleFlagModal = () => {
        setFlagModal(true)
    }

    const handleShowModal = () => {
        setIsModalVisible(true)
    }

    const hideFlagModal = () => {
        setFlagModal(false)
    }
    const handleHideModal = () => {
        setIsModalVisible(false)
    }

    const handleSubmitPrompt = async () => {
        if (!promptName.trim()) {
            alert('Please enter a prompt name before submitting.')
            return
        }

        const clauses = submittedData.map((data) => {
            const { clause_type, award_type, is_bonus, weight, check, id } = data
            const clause = {
                id: id.toString(),
                clause_type: clause_type,
                award_type: award_type,
                is_bonus: is_bonus,
                weight: weight,
                flag_name: flag,
                operator: operator,
                checks: [
                    {
                        ...(clause_type === 'llm' && {
                            option_name: check?.question || ''
                        }),
                        ...(clause_type === 'logic' && {
                            option_name: check?.option_name || '',
                            option_type: check?.option_type || '',
                            option_value: check?.option_value || ''
                        })
                    }
                ]
            }
            return clause
        })

        const jsonDataWithPrompt = {
            system_prompt: editableSystemPromptText,
            prompt_name: promptName,
            clauses: clauses as Clause[]
        }
        setJsonData(JSON.stringify(jsonDataWithPrompt, null, 2))
        setPromptSubmitted(true)
        const jsonResponse = await dispatch(saveValidationPrompt(jsonDataWithPrompt))
        console.log(jsonResponse)
        if (jsonResponse.payload.status === 200) {
            router.push(internalLinks.viewValidationPrompt)
        } else {
            alert('Something went wrong')
        }
    }

    return (
        <div className='grid items-center justify-center'>
            <h2 className='mb-2 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-center text-3xl font-bold text-transparent '>
                Create your Validation Prompt
            </h2>
            <div className='mt-10 grid max-w-2xl justify-center rounded-2xl border border-b-light bg-light-gray p-10 hover:bg-primary-light-transparent dark:border-b-dark dark:bg-dark-gray dark:hover:bg-primary-dark-trasparent sm:mx-auto sm:w-full'>
                <TextArea
                    title='System Propmt'
                    value={editableSystemPromptText}
                    placeholder='Enter your System Prompt'
                    className='w-96'
                    rows={6}
                    onChange={handleEditableSystemPromptChange}
                />
            </div>
            <div className='mt-10 grid max-w-3xl justify-center rounded-2xl border border-b-light bg-light-gray p-10 hover:bg-primary-light-transparent dark:border-b-dark dark:bg-dark-gray dark:hover:bg-primary-dark-trasparent sm:mx-auto sm:w-full'>
                <div className='grid grid-cols-2 place-items-center gap-4'>
                    <Button
                        className={`w-48 text-black ${logicForm ? '' : ''}`}
                        onClick={handleLogicButton}
                    >
                        LLM
                    </Button>
                    <Button className={`w-48 ${llmForm ? '' : ''}`} onClick={handleLLMButton}>
                        LOGIC
                    </Button>
                </div>

                <div className='mt-8 flex gap-4'>
                    <Dropdown
                        className='mt-1 h-10'
                        title='Award Type'
                        value={awardType}
                        options={['positive', 'negative']}
                        onChange={handleDropdownChange}
                    />
                    <TextField
                        title='Weightage'
                        placeholder='Enter Weightage'
                        className='w-44'
                        value={weightage}
                        type='number'
                        onChange={handleWeightageChange}
                    />
                    <div className='mt-2 flex flex-row gap-3'>
                        <ToggleButton
                            className='mt-1 h-10'
                            title='Bonus'
                            checked={bonusChecked}
                            onChange={handleBonus}
                        />

                        <ToggleButton
                            className='mt-1 h-10'
                            title='Red Flag'
                            checked={flagChecked}
                            onChange={handleFlagChange}
                        />
                    </div>

                    <FlagModal
                        // flag={flag}
                        // handleFlagChange={handleFlagChange}
                        operator={operator}
                        handleOperatorChange={handleOperatorChange}
                        flagModal={flagModal}
                        handleFlagModal={handleFlagModal}
                        hideFlagModal={hideFlagModal}
                    />
                </div>
                {logicForm && (
                    <LogicForm question={question} onQuestionChange={handleQuestionChange} />
                )}
                {llmForm && <LlmForm setLlmFormValues={handleLLMFormSubmit} />}
                <div className='grid justify-center'>
                    <Button className='mt-6 w-36' onClick={handleSubmit}>
                        Add Clause
                    </Button>
                </div>
            </div>

            <div className=''>
                <LlmTable submittedData={submittedData} />
                <LogicTable
                    submittedData={submittedData}
                    frontendValueMap={frontendValueMap}
                />
            </div>

            <PromptName
                promptName={promptName}
                handlePromptNameChange={handlePromptNameChange}
                handleSubmitPrompt={handleSubmitPrompt}
            />

            <JsonModal
                jsonData={jsonData}
                isModalVisible={isModalVisible}
                handleHideModal={handleHideModal}
                handleShowModal={handleShowModal}
                promptSubmitted={promptSubmitted}
            />
        </div>
    )
}

export default PromptsForm
