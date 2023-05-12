interface FilterSchema {
    region?: {
        name__in?: string[];
    };
    variable?: {
        name__in?: string[];
    };
    unit?: {
        name__in?: string[];
    };
    run?: Run;
}

