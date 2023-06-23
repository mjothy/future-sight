interface Run { // TODO rename RunSchema
    id?: number;
    version?: number;
    model?: {
        name?: string;
        name__in?: string[];
    };
    scenario?: {
        name?: string;
        name__in?: string[];
    };
    id__in?: string[]
    is_default?: boolean
}

