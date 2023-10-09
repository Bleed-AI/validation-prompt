interface Check {
    option_name: string
    option_value?: { min: number; max: number } | string
    option_type?: string
}

interface Clause {
    id: string
    clause_type: string
    award_type: string
    is_bonus: boolean
    flag_name?: string
    operator?: string
    weight: number
    checks: Check[]
}

interface ValidationPrompt {
    _id: string
    system_prompt: string
    prompt_name: string
    clauses: Clause[]
}
