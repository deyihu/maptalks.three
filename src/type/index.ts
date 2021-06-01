
import { GeoJSONLineStringFeature, GeoJSONPolygonFeature, GeoJSONMultiStringLineFeature, GeoJSONMultiPolygonFeature } from './GeoJSON';


export type SingleLineStringType = any | GeoJSONLineStringFeature;
export type SinglePolygonType = any | GeoJSONPolygonFeature;
export type LineStringType = SingleLineStringType | any | GeoJSONMultiStringLineFeature;
export type PolygonType = SinglePolygonType | any | GeoJSONMultiPolygonFeature;

export * from './BaseAttribute';
export * from './BaseOption';
export * from './GeoJSON';
export * from './Queue';
export * from './Material';