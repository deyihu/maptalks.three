import * as maptalks from 'maptalks';
import MergedMixin from './MergedMixin';
import BaseObject from './BaseObject';
import { getCenterOfPoints } from './util/ExtrudeUtil';
import { getExtrudeLineParams, LineStringSplit } from './util/LineUtil';
import ExtrudeLine from './ExtrudeLine';
import { isGeoJSON } from './util/GeoJSONUtil';
import { mergeBufferGeometries, mergeBufferGeometriesAttribute } from './util/MergeGeometryUtil';
import { distanceToVector3 } from './util';

const OPTIONS = {
    width: 3,
    height: 1,
    altitude: 0
};

class ExtrudeLines extends MergedMixin(BaseObject) {
    constructor(lineStrings, options, material, layer) {
        if (!Array.isArray(lineStrings)) {
            lineStrings = [lineStrings];
        }
        const centers = [], lineStringList = [];
        const len = lineStrings.length;
        for (let i = 0; i < len; i++) {
            const lineString = lineStrings[i];
            const result = LineStringSplit(lineString);
            centers.push(result.center);
            lineStringList.push(result.lineStrings);
        }
        // Get the center point of the point set
        const center = getCenterOfPoints(centers);
        const geometries = [], extrudeLines = [];
        let faceIndex = 0, faceMap = [], geometriesAttributes = [],
            psIndex = 0, normalIndex = 0;
        const cache = {};
        for (let i = 0; i < len; i++) {
            const lineString = lineStrings[i];
            const opts = maptalks.Util.extend({}, OPTIONS, isGeoJSON(lineString) ? lineString.properties : lineString.getProperties(), { index: i });
            const { height, width } = opts;
            const w = distanceToVector3(cache, width, layer);
            const h = distanceToVector3(cache, height, layer);
            const lls = lineStringList[i];
            const extrudeParams = [];
            for (let m = 0, le = lls.length; m < le; m++) {
                extrudeParams.push(getExtrudeLineParams(lls[m], w, h, layer, center));
            }
            const buffGeom = mergeBufferGeometriesAttribute(extrudeParams);
            geometries.push(buffGeom);

            const extrudeLine = new ExtrudeLine(lineString, opts, material, layer);
            extrudeLines.push(extrudeLine);

            const { position, normal, indices } = buffGeom;
            const faceLen = indices.length / 3;
            faceMap[i] = [faceIndex + 1, faceIndex + faceLen];
            faceIndex += faceLen;
            const psCount = position.length / 3,
                //  colorCount = buffGeom.attributes.color.count,
                normalCount = normal.length / 3;
            geometriesAttributes[i] = {
                position: {
                    count: psCount,
                    start: psIndex,
                    end: psIndex + psCount * 3,
                },
                normal: {
                    count: normalCount,
                    start: normalIndex,
                    end: normalIndex + normalCount * 3,
                },
                // color: {
                //     count: colorCount,
                //     start: colorIndex,
                //     end: colorIndex + colorCount * 3,
                // },
                // uv: {
                //     count: uvCount,
                //     start: uvIndex,
                //     end: uvIndex + uvCount * 2,
                // },
                hide: false
            };
            psIndex += psCount * 3;
            normalIndex += normalCount * 3;
            // colorIndex += colorCount * 3;
            // uvIndex += uvCount * 2;
        }
        const geometry = mergeBufferGeometries(geometries);

        options = maptalks.Util.extend({}, OPTIONS, options, { layer, lineStrings, coordinate: center });
        super();
        this._initOptions(options);

        this._createMesh(geometry, material);
        const { altitude } = options;
        const z = layer.distanceToVector3(altitude, altitude).x;
        const v = layer.coordinateToVector3(center, z);
        this.getObject3d().position.copy(v);

        //Face corresponding to monomer
        this._faceMap = faceMap;
        this._baseObjects = extrudeLines;
        this._datas = lineStrings;
        this._geometriesAttributes = geometriesAttributes;
        this.faceIndex = null;
        this._geometryCache = geometry.clone();
        this.isHide = false;
        this._colorMap = {};
        this._initBaseObjectsEvent(extrudeLines);
        this._setPickObject3d();
        this._init();
    }

    // eslint-disable-next-line no-unused-vars
    identify(coordinate) {
        return this.picked;
    }
}

export default ExtrudeLines;
