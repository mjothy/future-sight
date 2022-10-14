import { notification } from 'antd';

export default class Utils {
  static copyToClipboard = (path?: string) => {
    const url = path ? window.location.origin + path : window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      notification.info({
        message: `Link copied to clipboard`,
      });
    });
  };
}
