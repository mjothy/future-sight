import { notification } from 'antd';

export default class Utils {
  static copyToClipboard = (path?: string, params?: string) => {
    let url = path ? window.location.origin + path : window.location.href;
    url = params ? url + params : url
    navigator.clipboard.writeText(url).then(() => {
      notification.info({
        message: `Link copied to clipboard`,
      });
    });
  };
}
