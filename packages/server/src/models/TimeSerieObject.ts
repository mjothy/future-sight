export default interface TimeSerieObject {
    model: string;
    scenario: string;
    region: string;
    variable: string;
    unit: string;
    data: { value: number; year: number }
}