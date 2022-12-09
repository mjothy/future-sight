
const DEFAULT_FONT_SIZE = 10;

export default class PlotlyUtils {

    static getLabel = (str, size, element) => {
        if (str != undefined) {
            const lines = str.split("<br>");
            let width = size / DEFAULT_FONT_SIZE;
            const doc = document.getElementsByClassName(element)[0];
            if (doc !== undefined) {
                const fontSize: any = window.getComputedStyle(doc).getPropertyValue("font-size").split("px")[0];
                const sizeChar = parseFloat(fontSize);
                if (!isNaN(sizeChar)) {
                    width = size / sizeChar;
                }
            }
            let res = '';
            lines.forEach(line => {
                const text = this.stringDivider(line, width, "<br>");
                res = res + text + "<br>";
            });
            return res;
        }
        else return undefined;

    }

    static stringDivider = (str, width, spaceReplacer) => {
        if (str.length > width) {
            let p = width
            for (; p > 0 && str[p] != ' '; p--) {
                if (p > 0) {
                    const left = str.substring(0, p);
                    const right = str.substring(p + 1);
                    return left + spaceReplacer + this.stringDivider(right, width, spaceReplacer);
                }
            }
        }
        return str;
    }
}