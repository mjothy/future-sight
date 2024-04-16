import IDataManager from './IDataManager';
import IDraftManager from "../draftManager/ComponentPropsWithDraftManager";

export default interface ComponentPropsWithDataManager {
  dataManager: IDataManager;
  draftManager: IDraftManager
}
