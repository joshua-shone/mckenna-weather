export interface Forecast {
  cityName: string;
  tempMinKelvin: number;
  tempMaxKelvin: number;
  timeseries: TimeseriesItem[];
}

export interface TimeseriesItem {
  weatherCondition: string;
  weatherIcon: string;
  tempKelvin: number;
  timestampUtcMs: number;
}
