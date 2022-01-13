
import * as THREE from 'three';

export type BaseLayerOptionType = {
    renderer?: string,
    doubleBuffer?: boolean,
    glOptions?: {
        preserveDrawingBuffer: boolean
    },
    geometryEvents?: boolean,
    identifyCountOnEvent?: number,
    forceRenderOnMoving?: boolean,
    forceRenderOnRotating?: boolean,
    forceRenderOnZooming?: boolean,
    centerForDistance?,
    loopRenderCount?: number

};

export type BaseObjectOptionType = {
    interactive?: boolean,
    altitude?: number,
    minZoom?: number,
    maxZoom?: number,
    asynchronous?: boolean,
    properties?: any,
    layer?: any,
    coordinate?: any,
    lineString?: any,
    polygon?: any,
    index?: number,
    id?: string,
    center?: any
};

export type BarOptionType = BaseObjectOptionType & {
    radius?: number,
    height?: number,
    radialSegments?: number,
    topColor?: string,
    bottomColor?: string,
}

export type LineOptionType = BaseObjectOptionType & {
    bottomHeight?: number,
    colors?: Array<string | THREE.Color>
}

export type ExtrudePolygonOptionType = BaseObjectOptionType & {
    height?: number,
    bottomHeight?: number,
    topColor?: string,
    bottomColor?: string,
    key?: string
}
export type ExtrudeLineOptionType = BaseObjectOptionType & {
    bottomHeight?: number,
    width?: number,
    height?: number,
    topColor?: string,
    bottomColor?: string,
    key?: string
}

export type ExtrudeLineTrailOptionType = BaseObjectOptionType & {
    trail?: number,
    chunkLength?: number,
    width?: number,
    height?: number,
    speed?: number
}

export type PointOptionType = BaseObjectOptionType & {
    height?: number,
    color?: string | THREE.Color
    size?: number,
    coords?: number[]
}

export type HeatMapDataType = {
    coordinate,
    count: number,
    lnglat?,
    xy?,
}

export type HeatMapOptionType = BaseObjectOptionType & {
    min?: number,
    max?: number,
    size?: number,
    gradient?: { [key: number]: any },
    gridScale?: number
}

export type ImageType = string | HTMLCanvasElement | HTMLImageElement;

export type TerrainOptionType = BaseObjectOptionType & {
    image: ImageType,
    imageWidth?: number,
    imageHeight?: number,
    texture?: ImageType
}
