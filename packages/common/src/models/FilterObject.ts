
export interface FilterObject {
    [id: string]: {
        id: string;
        label: string;
        path: string;
        required: boolean;
        origin: string;
    }
}