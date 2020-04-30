import RBush from 'rbush';

class LabelManager {
    constructor(layer) {
        this.layer = layer;
        this._labels = [];
        this._currentLabels = [];
        this.rbush = new RBush();
    }

    cacheLabels(labels = []) {
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].isLabel) {
                this._labels.push(labels[i]);
            }
        }
        // sort by weight
        this._labels = this._labels.sort((a, b) => {
            return b.getWeight() - a.getWeight();
        });
    }

    removeLabels(labels = []) {
        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            for (let j = 0, len = this._labels.length; j < len; j++) {
                if (this._labels[j] === label) {
                    this._labels.splice(j, 1);
                    break;
                }
            }
        }
    }

    getLabels() {
        return this._labels;
    }

    getCurrentLabels() {
        return this._currentLabels;
    }

    insertValidate(label) {
        if (!label.isInCurrentView()) {
            return false;
        }
        const rect = label.getRect();
        if (this.rbush.collides(rect)) {
            return false;
        } else {
            this.rbush.insert(rect);
            return true;
        }
    }

    collides(e) {
        if (!this._labels.length) {
            return;
        }
        const extent = this.layer.getMap().getExtent();
        const labels = this._labels, currentLabels = [], removeLabels = [], addLabels = [];
        if (labels && labels.length) {
            for (let i = 0, len = labels.length; i < len; i++) {
                const label = labels[i];
                if (!label.isInCurrentView(extent)) {
                    label._collidesShow = false;
                    if (label._isAddToMap()) {
                        removeLabels.push(label);
                    }
                } else {
                    currentLabels.push(label);
                }
            }
        }
        if (e && (e.type === 'animating' || (e.type === 'zooming' && this.getLabels().length > 2000))) {
            for (let index = 0; index < removeLabels.length; index++) {
                removeLabels[index]._remove();
            }
            return;
        }
        this._currentLabels = [];
        if (this.rbush) {
            this.rbush.clear();
            if (currentLabels && currentLabels.length) {
                for (let i = 0, len = currentLabels.length; i < len; i++) {
                    const label = currentLabels[i];
                    const rect = label._rect || label.getRect();
                    const isAddToMap = label._isAddToMap();
                    if (this.rbush.collides(rect)) {
                        label._collidesShow = false;
                        if (isAddToMap) {
                            removeLabels.push(label);
                        }
                    } else {
                        this.rbush.insert(rect);
                        this._currentLabels.push(label);
                        label._collidesShow = true;
                        if (!isAddToMap) {
                            addLabels.push(label);
                        }
                    }
                    // label._rect = null;
                }
            }
        }
        for (let i = 0, len = Math.max(addLabels.length, removeLabels.length); i < len; i++) {
            if (removeLabels[i]) {
                removeLabels[i]._remove();
            }
            if (addLabels[i]) {
                addLabels[i].__add();
                addLabels[i].updatePosition();
            }
        }
    }
}

export default LabelManager;
