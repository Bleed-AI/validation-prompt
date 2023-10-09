import React, { useState, useEffect, ChangeEvent } from 'react'
import Dropdown from '@/components/UI/Dropdown/dropdown'
import TextField from '@/components/UI/Textfield/input'

export enum OptionType {
    RANGE = 'range',
    VALUE = 'value'
}

interface LlmFormProps {
    setLlmFormValues: (values: LlmFormValues) => void
}

export interface LlmFormValues {
    selectedValue: string
    minValue: string
    maxValue: string
    additionalFieldValue: string
    optionType: OptionType
}

const LlmForm: React.FC<LlmFormProps> = ({ setLlmFormValues }) => {
    const [selectedValue, setSelectedValue] = useState<string>('')
    const [minValue, setMinValue] = useState<string>('')
    const [maxValue, setMaxValue] = useState<string>('')
    const [additionalOptions, setAdditionalOptions] = useState<string[]>([])
    const [additionalFieldValue, setAdditionalFieldValue] = useState<string>('')
    const [optionType, setOptionType] = useState<OptionType>(OptionType.RANGE)

    const valueOptions: { [key: string]: string[] | number[] } = {
        'Hourly Pay': [1, 80],
        Ratings: [1, 5],
        'Total Spent per Hire': [1, 5],
        'Hire Rate': [0, 80],
        'Hours Billed': [1, 5],
        'Fixed Price': [1, 5],
        'Hourly Rate': [1, 5],
        Hours: ['More than 30hrs/week', 'Less than 30hrs/week'],
        'Job Type': ['Contract-to-hire'],
        Payment: ['Payment method verified', 'Payment method not verified'],
        'Project Length': [
            'Less than a month',
            '1 to 3 months',
            '3 to 6 months',
            'More than 6 months'
        ],
        'Expertise Level': ['Expert', 'Intermediate', 'Entry Level']
    }

    const handleDropdownChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(e.target.value)
        setOptionType(OptionType.RANGE)
        setMinValue('')
        setMaxValue('')
        setAdditionalOptions([])
        setAdditionalFieldValue('')

        if (setLlmFormValues) {
            setLlmFormValues({
                selectedValue: e.target.value,
                minValue: '',
                maxValue: '',
                additionalFieldValue: '',
                optionType: OptionType.RANGE
            })
        }

        if (valueOptions[e.target.value]) {
            const valueOption = valueOptions[e.target.value]
            setAdditionalOptions(valueOptions[e.target.value] as string[])
            setAdditionalFieldValue('')
            if (
                e.target.value === 'Hours' ||
                e.target.value === 'Job Type' ||
                e.target.value === 'Payment' ||
                e.target.value === 'Project Length' ||
                e.target.value === 'Expertise Level'
            ) {
                setOptionType(OptionType.VALUE)
                setMinValue('')
                setMaxValue('')
            } else {
                setOptionType(OptionType.RANGE)
                const [min, max] = valueOptions[e.target.value] as number[]
                setMinValue(min.toString())
                setMaxValue(max.toString())
            }
        }
    }

    const handleDropdownAdditionalChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setAdditionalFieldValue(e.target.value)

        if (setLlmFormValues) {
            setLlmFormValues({
                selectedValue,
                minValue: '',
                maxValue: '',
                additionalFieldValue: e.target.value,
                optionType: OptionType.VALUE
            })
        }
    }

    const handleMinValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newMinValue = e.target.value
        if (newMinValue === '' || parseInt(newMinValue) >= 0) {
            setMinValue(newMinValue)

            if (maxValue && parseInt(newMinValue) >= parseInt(maxValue)) {
                setMaxValue((parseInt(newMinValue) + 1).toString())
            }

            if (setLlmFormValues) {
                setLlmFormValues({
                    selectedValue,
                    minValue: newMinValue,
                    maxValue,
                    additionalFieldValue: '',
                    optionType: OptionType.RANGE
                })
            }
        }
    }

    const handleMaxValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newMaxValue = e.target.value
        if (newMaxValue === '' || parseInt(newMaxValue) >= 0) {
            setMaxValue(newMaxValue)

            if (minValue && parseInt(newMaxValue) <= parseInt(minValue)) {
                setMinValue((parseInt(newMaxValue) - 1).toString())
            }
        }
    }

    useEffect(() => {
        if (setLlmFormValues) {
            setLlmFormValues({
                selectedValue,
                minValue,
                maxValue,
                additionalFieldValue,
                optionType
            })
        }
    }, [selectedValue, minValue, maxValue, additionalFieldValue, optionType])

    return (
        <form>
            <div className='mt-5 flex justify-center'>
                <Dropdown
                    className=''
                    title='Options'
                    value={selectedValue}
                    options={[
                        'Hourly Pay',
                        'Ratings',
                        'Total Spent per Hire',
                        'Hire Rate',
                        'Hours Billed',
                        'Fixed Price',
                        'Hourly Rate',
                        'Hours',
                        'Job Type',
                        'Payment',
                        'Project Length',
                        'Expertise Level'
                    ]}
                    onChange={handleDropdownChange}
                />
            </div>

            {selectedValue && (
                <>
                    {[
                        'Hours',
                        'Job Type',
                        'Payment',
                        'Project Length',
                        'Expertise Level'
                    ].includes(selectedValue) ? (
                        <div className='mt-5 flex justify-center'>
                            <Dropdown
                                className=''
                                title='Fixed Values'
                                value={additionalFieldValue}
                                options={additionalOptions}
                                onChange={handleDropdownAdditionalChange}
                            />
                        </div>
                    ) : (
                        <div className='mt-5 flex justify-center gap-3'>
                            <div>
                                <TextField
                                    className='w-24'
                                    title='Maximum'
                                    type='number'
                                    value={maxValue}
                                    onChange={handleMaxValueChange}
                                    placeholder='Any'
                                />
                            </div>
                            <div>
                                <TextField
                                    className='w-24'
                                    title='Minimum'
                                    type='number'
                                    value={minValue}
                                    onChange={handleMinValueChange}
                                    placeholder='Any'
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </form>
    )
}

export default LlmForm
