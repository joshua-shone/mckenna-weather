import React from "react";

import styles from "./ForecastList.module.scss";

import { TimeseriesItem } from "../types/forecast";

interface Props {
  timeseries: TimeseriesItem[];
  selectedIndex: number;
  onItemSelected: (para: number) => any;
}

export default function ForecastList({
  timeseries,
  selectedIndex,
  onItemSelected,
}: Props) {
  function timestampToDisplayString(timestamp: number) {
    const datetime = new Date(timestamp);
    const hour = String(datetime.getHours()).padStart(2, "0");
    const minute = String(datetime.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  }

  function tempToDisplayString(kelvin: number) {
    const celsius = kelvin - 273.15;
    return `${Math.round(celsius)}°`;
  }

  return (
    <ul className={styles.ForecastList}>
      {timeseries.map((item, index) => (
        <li
          key={item.timestampUtcMs}
          onClick={() => onItemSelected(index)}
          className={index === selectedIndex ? styles.selected : ""}
        >
          <div>{timestampToDisplayString(item.timestampUtcMs)}</div>
          <img
            src={`/weather-condition-icons/${item.weatherIcon}.svg`}
            alt={item.weatherCondition}
          />
          <div className={styles.temp}>
            {tempToDisplayString(item.tempKelvin)}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ForecastListPlaceholder() {
  return <ul className={styles.ForecastListPlaceholder} />;
}
