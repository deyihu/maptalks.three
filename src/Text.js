import * as maptalks from 'maptalks';
import * as THREE from 'three';
import BaseObject from './BaseObject';
import { addAttribute } from './util/ThreeAdaptUtil';
import { getDefaultCharacterSet, generateSDF } from './util/text/glyph-manager.js';
import GlyphAtlas from './util/text/GlyphAtlas.js';
import TextGeometry from './util/text/TextGeometry';
// import { createLayout } from './util/text/TextLayout';
import createLayout from 'layout-bmfont-text';
import * as vertices from './util/text/Verticles';
// var createIndices = require('quad-indices')
import createIndices from 'quad-indices';
function generateFont(positions, width, height) {
    const chars = [];
    for (const key in positions) {
        const f = positions[key];
        for (let id in f) {
            const { metrics, rect } = f[id];
            const { advance, height, left, top, width } = metrics;
            const { x, y } = rect;
            const char = {
                chnl: 0,
                height,
                id: parseInt(id),
                page: 0,
                width,
                x,
                xadvance: advance,
                xoffset: left,
                y,
                yoffset: top
            };
            chars.push(char);
        }
    }
    return {
        chars,
        common: {
            lineHeight: 30,
            base: 24,
            scaleH: width,
            scaleW: height
        }
    };
}

const OPTIONS = {
    altitude: 0,
    text: 'hello',
    textField: 'name',
    fontFamily: 'Monaco, monospace',
    fontWeight: 400,
    fontSize: 14,
    fontColor: [0, 0, 0],
    fontOpacity: 1.0,
    haloColor: [255, 255, 255],
    haloWidth: 1.0,
    haloBlur: 0.2,

    symbolAnchor: 'center',
    textJustify: 'center',
    textSpacing: 2,
    textOffsetX: 0,
    textOffsetY: 0,
};


class Text extends BaseObject {
    constructor(coordinate, options, material, layer) {
        options = maptalks.Util.extend({}, OPTIONS, options, { layer, coordinate });
        super();
        this.initGlyphAtlas(options);

        let { altitude, text } = options;
        const z = layer.distanceToVector3(altitude, altitude).x;
        const v = layer.coordinateToVector3(coordinate, z);
        const { image, positions } = this.glyphAtlas;
        const font = generateFont(positions, image.width, image.height);
        this.layout = createLayout({
            font,
            text,
            width: image.width
        });
        var texWidth = font.common.scaleW;
        var texHeight = font.common.scaleH;

        // get visible glyphs
        var glyphs = this.layout.glyphs.filter(function (glyph) {
            var bitmap = glyph.data;
            return bitmap.width * bitmap.height > 0;
        });
        var ps = vertices.positions(glyphs);
        var uvs = vertices.uvs(glyphs, texWidth, texHeight, true);
        var indices = createIndices({
            clockwise: true,
            type: 'uint16',
            count: glyphs.length
        });
        const newps = [];
        for (let i = 0, len = ps.length; i < len; i += 2) {
            newps.push(ps[0], ps[i + 1], 0);
        }


        // update vertex data
        // buffer.index(this, indices, 1, 'uint16')
        // buffer.attr(this, 'position', positions, 2)
        // buffer.attr(this, 'uv', uvs, 2)
        const geometry = new TextGeometry();
        addAttribute(geometry, 'position', new THREE.Float32BufferAttribute(newps, 3, true));
        addAttribute(geometry, 'uv', new THREE.BufferAttribute(uvs, 2, true));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        const texture = new THREE.Texture(image.makeRGBAImageData());
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        material.uniforms.map.value = texture;

        this._initOptions(options);
        this._createMesh(geometry, material);
        this.getObject3d().position.copy(v);
    }

    initGlyphAtlas(options) {
        const { fontFamily, fontWeight } = options;
        const fontStack = `${fontFamily} ${fontWeight}`;
        this.fontStack = fontStack;
        const charts = getDefaultCharacterSet().concat(options.text.split(''));
        console.log(charts);
        const glyphMap = charts.map(char => {
            return generateSDF(fontStack, char);
        }).reduce((prev, cur) => {
            // @ts-ignore
            prev[cur.id] = cur;
            return prev;
        }, {});

        if (!this.glyphMap) {
            this.glyphMap = {};
        }

        this.glyphMap[fontStack] = glyphMap;

        this.glyphAtlas = new GlyphAtlas(this.glyphMap);

        // this.glyphAtlasTexture = this.regl.texture();
    }



}

export default Text;
