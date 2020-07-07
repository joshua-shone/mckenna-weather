import React, { useState, useEffect, useCallback } from "react";
import styles from "./App.module.scss";

import Header, { HeaderPlaceholder } from "./Header";
import ForecastList, { ForecastListPlaceholder } from "./ForecastList";
import ErrorModal from "./ErrorModal";

import { Forecast } from "../types/forecast";

interface Props {
  fetchForecast: () => Promise<Forecast>;
  locale: string;
}

function App({ fetchForecast, locale }: Props) {
  const [forecast, setForecast] = useState<null | Forecast>(null);
  const [error, setError] = useState<null | string>(null);

  const _fetchForecast = useCallback(async () => {
    try {
      const forecast = await fetchForecast();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Arbitrary delay to demonstrate loading state
      setForecast(forecast);
    } catch (e) {
      setError(
        "An error occurred while attempting to fetch weather data: " + e.message
      );
    }
  }, [fetchForecast]);

  useEffect(() => {
    _fetchForecast();
  }, [_fetchForecast]);

  async function retryFetch() {
    setError(null); // Clear any previous error
    // wait a moment so the error modal doesn't immediately re-appear
    await new Promise((resolve) => setTimeout(resolve, 500));
    _fetchForecast();
  }

  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className={styles.App}>
      {forecast === null ? (
        <HeaderPlaceholder />
      ) : (
        <Header
          locale={locale}
          city={forecast.cityName}
          weatherIcon={forecast.timeseries[selectedIndex].weatherIcon}
          weatherCondition={forecast.timeseries[selectedIndex].weatherCondition}
          tempMinKelvin={forecast.tempMinKelvin}
          tempMaxKelvin={forecast.tempMaxKelvin}
          tempKelvin={forecast.timeseries[selectedIndex].tempKelvin}
          timestampUtcMs={forecast.timeseries[selectedIndex].timestampUtcMs}
        />
      )}
      {forecast === null ? (
        <ForecastListPlaceholder />
      ) : (
        <ForecastList
          timeseries={forecast.timeseries}
          selectedIndex={selectedIndex}
          onItemSelected={(index) => setSelectedIndex(index)}
        />
      )}
      {error !== null ? <ErrorModal error={error} onRetry={retryFetch} /> : ""}
    </div>
  );
}

export default App;
