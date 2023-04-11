
// TODO add this interface to common
export interface FilterObject {
    [id: string]: {
        id: string;
        label: string;
        path: string;
        required: boolean;
        origin: string;
    }
}