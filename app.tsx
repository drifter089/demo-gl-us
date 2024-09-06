import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Map } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { scaleThreshold } from "d3-scale";

import StaticMap from "react-map-gl";
import { BASEMAP } from "@deck.gl/carto";

import type { Color, Position, PickingInfo, MapViewState } from "@deck.gl/core";
import type { Feature, Geometry, GeoJSON } from "geojson";
import { MyCustomLayers } from "./Layer";

// Source data GeoJSON
const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json"; // eslint-disable-line

// const MY_DATA_URL= 'http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Aall_clean_substations&maxFeatures=10000&outputFormat=application%2Fjson'

// const MY_LINES_DATA =
//   "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_all_clean_lines_US&maxFeatures=10000&outputFormat=application%2Fjson";

// const MY_OFF_SHORE_DATA =
//   "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_gadm_shapes_US&maxFeatures=10000&outputFormat=application%2Fjson";

const US_DATA = {
  id: "US",
  substations:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_all_clean_substations_US&maxFeatures=10000&outputFormat=application%2Fjson",
  buses:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_Buses_geojson_data_US&maxFeatures=10000&outputFormat=application%2Fjson",
  lines:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_network_lines_view_US&maxFeatures=10000&outputFormat=application%2Fjson",
  polygon:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_offshore_shapes_US&maxFeatures=10000&outputFormat=application%2Fjson",
};

const COLUMBIA_DATA = {
  // "PyPSAEarthDashboard:geojson_all_clean_substations_CO
  // geojson_Buses_geojson_data_CO_2;
  // geojson_network_lines_view_co_2;
  // geojson_offshore_shapes_CO;
  id: "CO",
  substations:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_all_clean_substations_CO&maxFeatures=10000&outputFormat=application%2Fjson",
  buses:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_Buses_geojson_data_CO_2&maxFeatures=10000&outputFormat=application%2Fjson",
  lines:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_network_lines_view_co_2&maxFeatures=10000&outputFormat=application%2Fjson",
  polygon:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Ageojson_offshore_shapes_CO&maxFeatures=10000&outputFormat=application%2Fjson",
};

const NIGERIA_DATA = {
  // all_clean_substations
  // Buses_geojson_data
  // network_lines_view
  // offshore_shapes;
  id: "NG",
  substations:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Aall_clean_substations&maxFeatures=10000&outputFormat=application%2Fjson",
  buses:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3ABuses_geojson_data&maxFeatures=10000&outputFormat=application%2Fjson",
  lines:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Anetwork_lines_view&maxFeatures=10000&outputFormat=application%2Fjson",
  polygon:
    "http://34.31.13.149:8000/geoserver/PyPSAEarthDashboard/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PyPSAEarthDashboard%3Aoffshore_shapes&maxFeatures=10000&outputFormat=application%2Fjson",
};

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 2,
  maxZoom: 16,
  pitch: 5,
  bearing: 0,
};

const MAP_STYLE =
  // "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function App({ mapStyle = MAP_STYLE }: { mapStyle?: string }) {
  // const [data, setFData] = useState<
  //   string | Feature<Geometry, BlockProperties>[]
  // >(MY_CLEAN_SUBSTATIONS);

  const countries = [US_DATA, COLUMBIA_DATA, NIGERIA_DATA];

  // const layers = [];

  // countries.forEach((x) => {
  //   layers.push(...MyCustomLayers(x.substations, x.buses, x.lines, x.polygon));
  // });

  const layers = countries.flatMap((country) =>
    MyCustomLayers(
      country.substations,
      country.buses,
      country.lines,
      country.polygon,
      country.id
    )
  );

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
