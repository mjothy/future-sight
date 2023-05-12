
// TODO add interface
export default class Filter {

    private body = {};
    constructor(selectedData) {
        this.body = {
            "models": this.modelBody(selectedData),
            "scenarios": this.scenarioBody(selectedData),
            "regions": this.regionsBody(selectedData),
            "variables": this.variableBody(selectedData)
        };
    }

    getBody = (filterId) => {
        return this.body[filterId] != null ? this.body[filterId] : {};
    }

    regionsBody = (selectedData) => {
        const requestBody: FilterSchema = {};

        if (selectedData["variables"]?.length > 0) {
            requestBody.variable = { name__in: selectedData["variables"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (selectedData["scenarios"]?.length > 0) {
            requestBody.run = {
                scenario: { name__in: selectedData["scenarios"] }
            };
        }

        if (selectedData["models"]?.length > 0) {
            requestBody.run = {
                model: { name__in: selectedData["models"] }
            };
        }

        return requestBody;

    }

    variableBody = (selectedData) => {
        const requestBody: FilterSchema = {};
        if (selectedData["regions"].length > 0) {
            requestBody.region = { name__in: selectedData["regions"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (selectedData["scenarios"]?.length > 0) {
            requestBody.run = {
                scenario: { name__in: selectedData["scenarios"] }
            };
        }

        if (selectedData["models"]?.length > 0) {
            requestBody.run = {
                model: { name__in: selectedData["models"] }
            };
        }

        return requestBody;
    }

    modelBody = (selectedData) => {
        const requestBody: FilterSchema = {};
        if (selectedData["regions"].length > 0) {
            requestBody.region = { name__in: selectedData["regions"] };
        }

        if (selectedData["variables"]?.length > 0) {
            requestBody.variable = { name__in: selectedData["variables"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (selectedData["scenarios"]?.length > 0) {
            requestBody.run = {
                scenario: { name__in: selectedData["scenarios"] }
            };
        }
        return requestBody;
    }

    scenarioBody = (selectedData) => {
        const requestBody: FilterSchema = {};
        if (selectedData["regions"].length > 0) {
            requestBody.region = { name__in: selectedData["regions"] };
        }

        if (selectedData["variables"]?.length > 0) {
            requestBody.variable = { name__in: selectedData["variables"] };
        }

        if (selectedData["units"]?.length > 0) {
            requestBody.unit = { name__in: selectedData["units"] };
        }

        if (selectedData["models"]?.length > 0) {
            requestBody.run = {
                model: { name__in: selectedData["models"] }
            };
        }
        return requestBody;
    }


}