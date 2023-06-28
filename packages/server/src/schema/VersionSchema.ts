interface VersionSchema {
    [model: string]: {
        [scenario: string]: {
            default?: Run, // Default here could be version
            values: Run[]
        }
    }
}

