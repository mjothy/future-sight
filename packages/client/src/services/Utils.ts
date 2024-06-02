import { notification } from 'antd';

export default class Utils {

  static getUrl = (path?: string, params?: string) => {
    let url = path ? window.location.origin + path : window.location.href;
    url = params ? url + params : url;
    return url;
  }

  static copyToClipboard = (path?: string, params?: string) => {
    const url = Utils.getUrl(path, params);
    navigator.clipboard.writeText(url).then(() => {
      notification.info({
        message: `Link copied to clipboard`,
      });
    });
  };

  static copyToClipboardEmbed = (path?: string, params?: string) => {
    const url = Utils.getUrl(path, params);
    const result = `<iframe width="100%" height="400" src="${url}" title="future-sight" allowfullscreen></iframe>`
    navigator.clipboard.writeText(result).then(() => {
      notification.info({
        message: `Link copied to clipboard`,
      });
    });
  }

  // static throttle(cb, delay = 1000) { // 2s

  //   let shouldWait = false
  //   let waitingArgs
  //   const timeoutFunc = () => {
  //     if (waitingArgs == null) {
  //       shouldWait = false
  //     } else { // To call the cb function at the end of excecution
  //       cb(...waitingArgs)
  //       waitingArgs = null
  //       setTimeout(timeoutFunc, delay)
  //     }
  //   }

  //   return (...args) => {
  //     if (shouldWait) {
  //       waitingArgs = args
  //       return
  //     }

  //     cb(...args)
  //     shouldWait = true
  //     setTimeout(timeoutFunc, delay)
  //   }
  // }

  static throttle_notif(cb, delay = 3500) { // Antd notif take 4.5s
    let shouldWait = false

    return (...args) => {
      if (shouldWait) return

      cb(...args)
      shouldWait = true
      setTimeout(() => {
        shouldWait = false
      }, delay)
    }
  }

  static showNotif = Utils.throttle_notif((title, description) => {
    return notification.error({
      message: title,
      description: description,
      placement: 'top',
    });
  }
  );

}
