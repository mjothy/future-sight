import DataModel from './DataModel';

export default class DataModelSet<T extends DataModel> extends Set<T> {
  add(value: T): this {
    let found = false;
    this.forEach((item) => {
      if (
        value.model === item.model &&
        value.scenario === item.scenario &&
        value.variable === item.variable &&
        value.region === item.region
      ) {
        found = true;
      }
    });

    if (!found) {
      super.add(value);
    }

    return this;
  }
}
