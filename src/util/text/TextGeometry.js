import * as THREE from 'three';
import { computeSphere, computeBox } from './Verticles';

class TextGeometry extends THREE.BufferGeometry {

    computeBoundingSphere() {
        if (this.boundingSphere === null) {
            this.boundingSphere = new THREE.Sphere();
        }

        var positions = this.attributes.position.array;
        var itemSize = this.attributes.position.itemSize;
        if (!positions || !itemSize || positions.length < 2) {
            this.boundingSphere.radius = 0;
            this.boundingSphere.center.set(0, 0, 0);
            return;
        }
        computeSphere(positions, this.boundingSphere);
        if (isNaN(this.boundingSphere.radius)) {
            console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
                'Computed radius is NaN. The ' +
                '"position" attribute is likely to have NaN values.');
        }
    }

    computeBoundingBox() {
        if (this.boundingBox === null) {
            this.boundingBox = new THREE.Box3();
        }

        var bbox = this.boundingBox;
        var positions = this.attributes.position.array;
        var itemSize = this.attributes.position.itemSize;
        if (!positions || !itemSize || positions.length < 2) {
            bbox.makeEmpty();
            return;
        }
        computeBox(positions, bbox);
    }
}

export default TextGeometry;

