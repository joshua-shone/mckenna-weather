import React from "react";

import styles from "./Header.module.scss";

interface Props {
  locale: string;
  weatherIcon: string;
  weatherCondition: string;
  city: string;
  tempMinKelvin: number;
  tempMaxKelvin: number;
  tempKelvin: number;
  timestampUtcMs: number;
}

export default function Header({
  locale,
  weatherIcon,
  weatherCondition,
  city,
  tempMinKelvin,
  tempMaxKelvin,
  tempKelvin,
  timestampUtcMs,
}: Props) {
  const date = new Date(timestampUtcMs);
  const dayOfWeek = date.toLocaleDateString(locale, { weekday: "long" });
  const dayAndMonth = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
  });

  function tempToDisplayString(kelvin: number) {
    const celsius = kelvin - 273.15;
    return `${Math.round(celsius)}°`;
  }

  return (
    <header className={styles.Header}>
      <span className={styles.secondaryTiles}>
        <img
          className={styles.tile + " " + styles.weatherStateIcon}
          src={`/weather-condition-icons/${weatherIcon}.svg`}
          alt={weatherCondition}
        />

        <span className={styles.tile}>
          <div className={styles.typeAndMinMax}>
            <span
              className={styles.weatherCondition}
              data-testid="weather-condition"
            >
              {weatherCondition}
            </span>
            <span className={styles.minMaxTemp}>
              <span>{tempToDisplayString(tempMaxKelvin)}</span> /{" "}
              <span>{tempToDisplayString(tempMinKelvin)}</span>
            </span>
          </div>
          <div className={styles.currentTemp} data-testid="current-temp">
            {tempToDisplayString(tempKelvin)}
          </div>
        </span>
      </span>

      <span className={styles.tile}>
        <div className={styles.cityName} data-testid="city-name">
          {city}
        </div>
        <div className={styles.dayOfWeek} data-testid="day-of-week">
          {dayOfWeek}
        </div>
        <div className={styles.dayAndMonth} data-testid="day-and-month">
          {dayAndMonth}
        </div>
      </span>
    </header>
  );
}

export function HeaderPlaceholder() {
  return (
    <header className={styles.HeaderPlaceholder}>
      <span></span>
      <div>
        <span></span>
        <span></span>
      </div>
    </header>
  );
}
