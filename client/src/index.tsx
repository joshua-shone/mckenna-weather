import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./components/App";

import { Forecast } from "./types/forecast";

async function fetchForecast() {
  const response = await fetch("http://localhost:8080/api");
  return (await response.json()) as Forecast;
}

ReactDOM.render(
  <React.StrictMode>
    <App fetchForecast={fetchForecast} locale={navigator.language} />
  </React.StrictMode>,
  document.getElementById("root")
);
