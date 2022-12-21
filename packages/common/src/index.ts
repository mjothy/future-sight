export const App_Name = 'My Cool Webapp';
// export { default as DashboardSelectionControl} from "./dashboard/DashboardSelectionControl";
export { default as Dashboard } from './dashboard/Dashboard';
export { default as DashboardModel } from './models/DashboardModel';
export { default as BlockModel } from './models/BlockModel';
export { default as LayoutModel } from './models/LayoutModel';
export { default as ReadOnlyDashboard } from './dashboard/ReadOnlyDashboard';

export type { default as IDataManager } from './datamanager/IDataManager';
export type { default as ComponentPropsWithDataManager } from './datamanager/ComponentPropsWithDataManager';
export type { default as ModelScenarioData } from './datamanager/ModelScenarioData';
export type { default as DataModel } from './models/DataModel';
export type { default as PlotDataModel } from './models/PlotDataModel';
export type { DashboardProps } from './dashboard/Dashboard';
export { default as DataStructureModel } from './models/DataStructureModel';
export { default as BlockDataModel } from './models/BlockDataModel';
export { default as ConfigurationModel } from './models/ConfigurationModel'
export { getSelectedFilter, compareDataStructure, blocksIdToDelete } from './dashboard/blocks/utils/DashboardUtils';
export { getControlBlock, getUnselectedInputOptions, getChildrens} from './dashboard/blocks/utils/BlockDataUtils';
export { default as SelectInput } from './dashboard/blocks/utils/SelectInput';

