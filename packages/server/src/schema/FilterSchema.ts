interface FilterSchema {
    region?: {
        name?: string;
        name__in?: string[];
    };
    variable?: {
        name?: string;
        name__in?: string[];
    };
    unit?: {
        name?: string;
        name__in?: string[];
    };
    run?: Run;
    model?: {
        name?: string;
        name__in?: string[];
    };
    scenario?: {
        name?: string;
        name__in?: string[];
    };
    year__in?: number[];
}

