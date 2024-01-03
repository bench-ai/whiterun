export const PasswordRequirementsKeys = ['LENGTH', 'LOWER', 'UPPER', 'SPECIAL'] as const
export type PasswordRequirement = typeof PasswordRequirementsKeys[number];

export const PasswordRequirementsValues = {
    "LENGTH":  "Contain at least 10 characters",
    "LOWER": "Contain at least one lowercase letter",
    "UPPER": "Contain at least one uppercase letter",
    "SPECIAL": "Contain at least one special symbol",
}