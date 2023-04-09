import filters from './filters.json'

export default class FilterManager {

    private readonly possible_filters = filters;

    getFilters = () => {
        return this.possible_filters;
    }
    // getFilterOptionsBody = (filter:FilterObject) => {

    // }



}