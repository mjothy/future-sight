export default class UserDataModel {
  static fromJson(json) : UserDataModel{
    let ret = new UserDataModel();
    ret.title = json.title;
    ret.author = json.author;
    ret.tags = json.tags
    return ret;
  }

  title = '';
  author = '';
  tags: string[] = [];
}
