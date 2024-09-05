import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { scaleThreshold } from "d3-scale";

import StaticMap from "react-map-gl";
import { BASEMAP } from "@deck.gl/carto";

import type { Color, Position, PickingInfo, MapViewState } from "@deck.gl/core";
import type { Feature, Geometry, GeoJSON } from "geojson";

// Source data GeoJSON
const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json"; // eslint-disable-line

// const MY_DATA_URL= 'http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Aall_clean_substations&maxFeatures=10000&outputFormat=application%2Fjson'

const MY_CLEAN_SUBSTATIONS =
  "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_all_clean_substations_US&maxFeatures=10000&outputFormat=application%2Fjson";

const MY_BUS_DATA =
  "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_Buses_geojson_data_US&maxFeatures=10000&outputFormat=application%2Fjson";

const MY_LINES_DATA =
  "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_network_lines_view_US&maxFeatures=10000&outputFormat=application%2Fjson";

const MY_OFF_SHORE_DATA =
  "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_offshore_shapes_US&maxFeatures=10000&outputFormat=application%2Fjson";

export const COLOR_SCALE = scaleThreshold<number, Color>()
  .domain([
    -0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2,
  ])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38],
  ]);

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 2,
  maxZoom: 16,
  pitch: 5,
  bearing: 0,
};

// const MAP_STYLE =
// "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

type BlockProperties = {
  name: string;
  coordinates: [longitude: number, latitude: number];
};

export default function App({
  // data = DATA_URL,
  // data = MY_DATA_URL,
  mapStyle = MAP_STYLE,
}: {
  // data?: string | Feature<Geometry, BlockProperties>[];
  mapStyle?: string;
}) {
  const [data, setFData] = useState<
    string | Feature<Geometry, BlockProperties>[]
  >(MY_CLEAN_SUBSTATIONS);

  const [busData, setBusData] = useState<
    string | Feature<Geometry, BlockProperties>[]
  >(MY_BUS_DATA);

  const [linesData, setLinesData] = useState<
    string | Feature<Geometry, BlockProperties>[]
  >(MY_LINES_DATA);

  const [polygonData, setPolygonData] = useState<
    string | Feature<Geometry, BlockProperties>[]
  >(MY_OFF_SHORE_DATA);

  const layers = [
    new GeoJsonLayer<BlockProperties>({
      id: "geojson",
      data,
      opacity: 0.8,
      stroked: false,
      filled: true,
      pointType: "circle",
      // extruded: true,
      wireframe: true,
      getPointRadius: 400,
      pointRadiusScale: 30,
      // getFillColor: (f) => COLOR_SCALE(f.properties.growth),
      getFillColor: [79, 167, 70],

      // getLineColor: [155, 255, 255],
      pickable: true,
    }),
    new GeoJsonLayer<BlockProperties>({
      id: "Buses",
      data: busData,
      opacity: 0.8,
      stroked: false,
      filled: true,
      pointType: "circle",
      // extruded: true,
      wireframe: true,
      getPointRadius: 500,
      pointRadiusScale: 100,
      // getFillColor: (f) => COLOR_SCALE(f.properties.growth),
      getFillColor: [72, 123, 182],
      pickable: true,
    }),
    new GeoJsonLayer<BlockProperties>({
      id: "Lines",
      data: linesData, // Use your line GeoJSON data here
      opacity: 0.8,
      stroked: true, // Set to true to render lines
      filled: true, // Since we are focusing on lines, filled should be false
      // wireframe: true,

      // Function to determine the line width
      getLineWidth: 1000, // This can be a fixed value or derived from the feature properties
      lineWidthScale: 20, // Scaling factor for the line width

      // Function to determine the color of the lines
      getLineColor: [227, 26, 28], // RGB color for the lines (blue in this case)
      getFillColor: [227, 26, 28],

      // Optional: Make lines pickable for user interaction (hover/click)
      pickable: true,
      // Optional: Highlight the lines when hovered
      autoHighlight: true,
      // highlightColor: [255, 255, 0, 255], // Yellow color for highlighting
    }),
    new GeoJsonLayer({
      id: "geojson-layer",
      data: polygonData, // Provide your GeoJSON data here
      stroked: true,
      opacity: 0.4,
      filled: true, // Set filled to false if you only want dashed outlines
      extruded: false, // No extrusion for dashed lines

      wireframe: false, // Display wireframe if extruding polygons (optional)

      // Get the elevation of the polygons (not used since extruded is false)
      getElevation: 0,

      // Set the color of the polygon borders (not the fill since filled: false)
      getLineColor: [225, 75, 75, 0.2], // Set border color (black in this case)
      getFillColor: [225, 75, 75], // Set border color (black in this case)

      // Use dashArray to create dashed lines
      dashArray: [10, 5], // Pattern: 10px dash, 5px gap

      // Line width for the dashed lines
      getLineWidth: 2,

      pickable: true, // Allows user interaction (hover, click)
    }),

    // new ScatterplotLayer<BlockProperties>({
    //   id: "ScatterplotLayer",
    //   // data: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json",
    //   data,
    //   stroked: true,
    //   getPosition: (d) => {
    //     return d.coordinates;
    //   },
    //   getRadius: (d: BlockProperties) => Math.sqrt(49),
    //   getFillColor: [255, 140, 0],
    //   getLineColor: [0, 0, 0],
    //   getLineWidth: 10,
    //   radiusScale: 6,
    //   pickable: true,
    //   onDataLoad: (d) => {
    //     console.log(d);
    //   },
    // }),
  ];

  return (
    <DeckGL
      layers={layers}
      // effects={effects}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <Map reuseMaps mapStyle={mapStyle} />
      {/* <StaticMap mapStyle={BASEMAP.POSITRON} /> */}
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
