
import * as maptalks from 'maptalks';

const OPTIONS = {
    animationDuration: 0,
    cssText: '',
    className: ''
};

/**
 * support altitude
 */
class UIMarker extends maptalks.ui.UIMarker {

    constructor(coordinate, options) {
        super(coordinate, maptalks.Util.extend({}, OPTIONS, options));
    }

    buildOn() {
        const dom = document.createElement('div');
        const options = this.options;
        if (options.height) {
            dom.style.height = options.height + 'px';
        }
        if (options.width) {
            dom.style.width = options.width + 'px';
        }
        const className = options.className;
        const content = options.content;
        dom.innerHTML = `<div class='${className}' style='${options.cssText};width:100%;height:100%;'>${content}</div>`;
        return dom;
    }

    _setPosition() {
        // const dom = this.getDOM();
        // if (!dom) return;
        // dom.style[TRANSITION] = null;
        // const p = this.getPosition();
        // this._pos = p;
        // dom.style[TRANSFORM] = this._toCSSTranslate(p) + ' scale(1)';
    }

    __updatePosition(rect) {
        const { __uiDOM } = this;
        if (__uiDOM) {
            const { x, y } = rect;
            __uiDOM.style.transform = 'none';
            __uiDOM.style.left = `${x}px`;
            __uiDOM.style.top = `${y}px`;
        }
    }
}

export default UIMarker;
