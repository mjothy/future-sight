interface Run {
    id?: number;
    version?: number;
    model?: {
        name__in?: string[];
    };
    scenario?: {
        name__in?: string[];
    };
}

