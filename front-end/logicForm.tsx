import React, { ChangeEvent } from 'react'
import TextArea from '@/components/UI/Textarea/textarea'

interface LogicFormProps {
    question: string
    onQuestionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

const LogicForm: React.FC<LogicFormProps> = ({ question, onQuestionChange }) => {
    return (
        <form>
            <div className='grid max-w-2xl justify-center rounded-2xl p-6 sm:mx-auto sm:w-full'>
                <div className='flex justify-center'>
                    <TextArea
                        title='Question'
                        placeholder='Your Question'
                        className='w-96'
                        rows={5}
                        value={question}
                        onChange={onQuestionChange}
                    />
                </div>
            </div>
        </form>
    )
}

export default LogicForm
