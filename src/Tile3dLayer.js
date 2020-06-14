
import WebMercatorViewport from '@deck.gl/core/dist/esm/viewports/web-mercator-viewport';
import { load } from '@loaders.gl/core';
import { Tileset3D } from '@loaders.gl/tiles';
import { Tiles3DLoader } from '@loaders.gl/3d-tiles';

class Tile3dLayer {
    constructor(url, options, material, layer) {
        this.url = url;
        const viewport = this.viewPort = new WebMercatorViewport(this.getViewOptions(layer));
        load(url, Tiles3DLoader).then(tilesetJson => {
            const tileset3d = new Tileset3D(tilesetJson, {
                onTileLoad: tile => console.log(tile)
            });
            tileset3d.update(viewport);
        });

    }

    getViewOptions(layer) {
        const map = layer.getMap();
        const { center, pitch, bearing } = map.getView();
        const size = map.getSize();
        return {
            longitude: center[0],
            latitude: center[1],
            zoom: getMapBoxZoom(map.getResolution()),
            pitch: pitch,
            bearing: bearing,
            width: size.width,
            height: size.height
        };
    }
}

const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20));
function getMapBoxZoom(res) {
    return 19 - Math.log(res / MAX_RES) / Math.LN2;
}
export default Tile3dLayer;

