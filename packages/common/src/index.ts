export const App_Name = 'My Cool Webapp';

// export { default as DashboardSelectionControl} from "./dashboard/DashboardSelectionControl";
export { default as Dashboard } from './dashboard/Dashboard';
export { default as ReadOnlyDashboard } from './dashboard/ReadOnlyDashboard';
export { getSelectedFiltersLabels, compareDataStructure, blocksIdToDelete } from './dashboard/blocks/utils/DashboardUtils';
export { getBlock, getUnselectedInputOptions, getChildrens } from './dashboard/blocks/utils/BlockDataUtils';
export { default as SelectInput } from './dashboard/blocks/utils/SelectInput';
export { default as withColorizer } from './hoc/colorizer/withColorizer';
export { default as ColorizerProvider } from './hoc/colorizer/ColorizerProvider';
export { default as Colorizer } from './hoc/colorizer/colorizer';

// Models
export { default as DashboardModel } from './models/DashboardModel';
export { default as BlockModel } from './models/BlockModel';
export { default as LayoutModel } from './models/LayoutModel';
export type { default as DataModel } from './models/DataModel';
export type { default as IDataManager } from './datamanager/IDataManager';
export type { default as ComponentPropsWithDataManager } from './datamanager/ComponentPropsWithDataManager';
export type { default as ModelScenarioData } from './datamanager/ModelScenarioData';
export type { DashboardProps } from './dashboard/Dashboard';
export { default as DataStructureModel } from './models/DataStructureModel';
export { default as BlockDataModel } from './models/BlockDataModel';
export { default as ConfigurationModel } from './models/ConfigurationModel'
export type { default as PlotDataModel } from './models/PlotDataModel';
export type { default as IndexToColorModel } from './models/IndexToColorModel';
export { default as OptionsDataModel } from './models/OptionsDataModel';
export type { FilterObject } from './models/FilterObject';
