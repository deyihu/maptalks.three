/* eslint-disable indent */
import * as maptalks from 'maptalks';
import BaseObject from './BaseObject';
import { vector2Pixel } from './util/IdentifyUtil';
import UIMarker from './ui/UIMarker';

const OPTIONS = {
    height: 30,
    width: 100,
    altitude: 0,
    horizontalAlign: 'center' || 'left' || 'right',
    verticalAlign: 'bottom' || 'top' || 'middle',
    weight: 0,
    content: '',
    dx: 0,
    dy: 0
};

/**
 * html label
 */
class Label extends BaseObject {
    constructor(coordinate, options, material, layer) {
        if (!(coordinate instanceof maptalks.Coordinate)) {
            coordinate = new maptalks.Coordinate(coordinate);
        }
        options = maptalks.Util.extend({}, OPTIONS, options, { layer, coordinate });
        super();
        this._initOptions(options);
        const { altitude } = options;
        const z = layer.distanceToVector3(altitude, altitude).x;
        const position = layer.coordinateToVector3(coordinate, z);
        this.position = position;
        this.object3d = new UIMarker(coordinate, options);
        this.object3d.uuid = maptalks.Util.GUID();
        this.object3d.__parent = this;
        this.isLabel = true;
        this.labelManager = layer.labelManager;
        this._collidesShow = true;
        this._rect = null;
        this._init();
    }

    isCollidesShow() {
        return this._collidesShow;
    }

    isInCurrentView(extent) {
        extent = extent || this.getMap().getExtent();
        const { xmin, ymin, xmax, ymax } = extent;
        const { x, y } = this.getOptions().coordinate;
        // Higher performance
        return (x >= xmin && x <= xmax && y >= ymin && y <= ymax);
        // return extent.contains(this.getCenter());
    }

    getWeight() {
        return this.getOptions().weight;
    }

    getRect() {
        const uimarkerParent = this._getParentTransform();
        const { width, height, horizontalAlign, verticalAlign, dx, dy } = this.getOptions();
        const size = this.getMap().getSize();
        const position = this.position.clone();
        const pixel = vector2Pixel(position, size, this.getLayer().getCamera());
        let { x, y } = pixel;
        switch (horizontalAlign) {
            case 'left':
                break;
            case 'center':
                x -= width / 2;
                break;
            case 'right':
                x -= width;
                break;
        }
        x += dx;
        x -= uimarkerParent.w;
        switch (verticalAlign) {
            case 'top':
                break;
            case 'middle':
                y -= height / 2;
                break;
            case 'bottom':
                y -= height;
                break;
        }
        y += dy;
        y -= uimarkerParent.h;
        return {
            x, y, width, height,
            minX: x - 2,
            minY: y - 2,
            maxX: x + width + 2,
            maxY: y + height + 2
        };
    }

    updatePosition(rect) {
        this.getObject3d().__updatePosition(rect || this.getRect());
    }

    // eslint-disable-next-line no-unused-vars
    identify(coordinate, pixel) {
        if (!this.isCollidesShow() || (!this.getOptions().interactive)) {
            return false;
        }
        const { x, y } = pixel;
        const rect = this.getRect();
        const { minX, minY, maxX, maxY } = rect;
        return (x >= minX && x <= maxX && y >= minY && y <= maxY);
    }

    setAltitude(altitude) {
        if (maptalks.Util.isNumber(altitude)) {
            const z = this.getLayer().distanceToVector3(altitude, altitude).x;
            this.position.z = z;
            this.options.altitude = altitude;
            this.updatePosition();
        }
        return this;
    }


    show() {
        this.getObject3d().show();
        this._fire('show');
        return this;
    }


    hide() {
        this.getObject3d().hide();
        this._fire('hide');
        return this;
    }

    isVisible() {
        return (this.getObject3d().isVisible());
    }

    _init() {
        this.on('add', () => {
            this.updatePosition();
        });
    }

    _animation() {
        if (this.isCollidesShow()) {
            const rect = this.getRect();
            this._rect = rect;
            this.updatePosition(rect);
        } else {
            this._rect = this.getRect();
        }
    }

    _getParentTransform() {
        const parent = this.getMap()._panels.front;
        const transform = parent.style.transform;
        const tarr = transform.split(',');
        tarr[0] = tarr[0].replace('translate3d(', '').replace('px', '');
        tarr[1] = tarr[1].replace(' ', '').replace('px', '');
        return {
            w: parseFloat(tarr[0]),
            h: parseFloat(tarr[1])
        };
    }

    _isAddToMap() {
        if (!this.getObject3d().__uiDOM) {
            return false;
        }
        return (!!this.getObject3d().__uiDOM.parentElement);
    }

    _add() {
        if (this.labelManager.insertValidate(this)) {
            const map = this.getMap();
            this.getObject3d().addTo(map);
        }
        return this;
    }

    _remove() {
        this.getObject3d().remove();
        return this;
    }

    __add() {
        const map = this.getMap();
        this.getObject3d().addTo(map);
    }
}

export default Label;
