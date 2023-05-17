interface Run {
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
}

