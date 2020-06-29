package main

import (
  "net/http"
  "log"
  "io/ioutil"
  "encoding/json"
  "flag"
  "time"
  "errors"
)

const openWeatherSampleEndpoint = "https://samples.openweathermap.org/data/2.5/forecast?q=M%C3%BCnchen,DE&appid=b6907d289e10d714a6e88b30761fae22"

type OpenWeather_Forecast struct {
  City OpenWeather_City `json:"city"`
  List []OpenWeather_ListItem `json:"list"`
}
type OpenWeather_City struct {
  Name string `json:"name"`
}
type OpenWeather_ListItem struct {
  Dt int64 `json:"dt"`
  Main OpenWeather_Main `json:"main"`
  Weather []OpenWeather_Weather `json:"weather"`
}
type OpenWeather_Main struct {
  Temp float32 `json:"temp"`
  TempMin float32 `json:"temp_min"`
  TempMax float32 `json:"temp_max"`
}
type OpenWeather_Weather struct {
  Main string `json:"main"`
  Icon string `json:"icon"`
}

type ApiResponse struct {
  CityName string `json:"cityName"`
  TempMinKelvin float32 `json:"tempMinKelvin"`
  TempMaxKelvin float32 `json:"tempMaxKelvin"`
  Timeseries []ApiResponse_Timeseries `json:"timeseries"`
}
type ApiResponse_Timeseries struct {
  TimestampUtcMs int64 `json:"timestampUtcMs"`
  TempKelvin float32 `json:"tempKelvin"`
  WeatherCondition string `json:"weatherCondition"`
  WeatherIcon string `json:"weatherIcon"`
}
// Note: The OpenWeather API is missing units in its key names. These API response types add them e.g. kelvin, UtcMs

var rainyWeatherConditions = []OpenWeather_Weather{
  {"Thunderstorm", "11d"},
  {"Drizzle", "10d"},
  {"Rain", "09d"},
  {"Snow", "13d"}, // Not rain per se, but is a kind of precipitation
}

func main() {
  openweather_endpoint := flag.String("openweather_endpoint", openWeatherSampleEndpoint, "A URL to an OpenWeather API endpoint. Defaults to a sample data endpoint.")
  allow_origin := flag.String("allow_origin", "http://localhost:3000", "An origin to allow for CORS. Defaults to allowing a local React development server.")
  flag.Parse()

  http.HandleFunc("/api", func (response http.ResponseWriter, request *http.Request) {

    // Enable CORS
    response.Header().Set("Access-Control-Allow-Origin", *allow_origin)

    openWeatherResponse, err := http.Get(*openweather_endpoint)
    // TODO: poll and store OpenWeather data separately from incoming requests to avoid excessive API usage
    if err != nil {
      response.WriteHeader(http.StatusInternalServerError)
      response.Write([]byte("Could not retreive OpenWeather data"))
      log.Println(err)
      return
    }
    defer openWeatherResponse.Body.Close()

    if openWeatherResponse.StatusCode != 200 {
      response.WriteHeader(http.StatusInternalServerError)
      response.Write([]byte("Could not retreive OpenWeather data"))
      log.Println("Received non-200 response from OpenWeather:", openWeatherResponse.StatusCode, http.StatusText(openWeatherResponse.StatusCode))
      return
    }

    openWeatherBody, err := ioutil.ReadAll(openWeatherResponse.Body)
    if err != nil {
      response.WriteHeader(http.StatusInternalServerError)
      response.Write([]byte("Could not retreive OpenWeather data"))
      log.Println(err)
      return
    }

    openWeatherForecast := OpenWeather_Forecast{}
    err = json.Unmarshal(openWeatherBody, &openWeatherForecast)
    if err != nil {
      response.WriteHeader(http.StatusInternalServerError)
      response.Write([]byte("Could not parse OpenWeather data"))
      log.Println(err)
      return
    }

    apiResponse, err := createApiResponse(&openWeatherForecast)
    if err != nil {
      response.WriteHeader(http.StatusInternalServerError)
      response.Write([]byte(err.Error()))
      log.Println(err)
      return
    }

    apiResponseString, err := json.Marshal(apiResponse)
    if err != nil {
      response.WriteHeader(http.StatusInternalServerError)
      response.Write([]byte("An error occurred while attempting to serialize a JSON response"))
      log.Println(err)
      return
    }

    response.Header().Set("Content-Type", "application/json")
    response.Write([]byte(apiResponseString))
  })

  err := http.ListenAndServe(":8080", nil)
  log.Fatal(err)
}

func createApiResponse(openWeatherForecast *OpenWeather_Forecast) (*ApiResponse, error) {
  if len(openWeatherForecast.List) == 0 {
    return nil, errors.New("OpenWeather returned zero list elements")
  }

  // Calculate min/max temperatures for the day
  tempMinKelvin := openWeatherForecast.List[0].Main.TempMin
  tempMaxKelvin := openWeatherForecast.List[0].Main.TempMax
  for _, listItem := range openWeatherForecast.List[1:] {
    if listItem.Main.TempMin < tempMinKelvin { tempMinKelvin = listItem.Main.TempMin }
    if listItem.Main.TempMax > tempMaxKelvin { tempMaxKelvin = listItem.Main.TempMax }
  }

  // Get forecast entries
  apiResponseTimeseries := make([]ApiResponse_Timeseries, len(openWeatherForecast.List))
  for index, listItem := range openWeatherForecast.List {
    apiResponseTimeseries[index].TimestampUtcMs = listItem.Dt * 1000
    apiResponseTimeseries[index].TempKelvin = listItem.Main.Temp

    if len(listItem.Weather) != 1 {
      return nil, errors.New("OpenWeather returned an unexpected number of weather entries in a list item")
    }

    isRainy := false
    for _, rainyCondition := range rainyWeatherConditions {
      if listItem.Weather[0].Main == rainyCondition.Main {
        isRainy = true
        break
      }
    }

    if isRainy {
      // If the actual weather is already rainy, use it in the response
      apiResponseTimeseries[index].WeatherCondition = listItem.Weather[0].Main
      apiResponseTimeseries[index].WeatherIcon = listItem.Weather[0].Icon
    } else {
      // Replace the non-rainy weather condition from OpenWeather with a rainy one
      // A different rainy condition is chosen from the list on each hour
      hour := listItem.Dt / int64(time.Hour / time.Second)
      weatherCondition := rainyWeatherConditions[hour % int64(len(rainyWeatherConditions))]
      apiResponseTimeseries[index].WeatherCondition = weatherCondition.Main
      apiResponseTimeseries[index].WeatherIcon = weatherCondition.Icon
    }
  }

  return &ApiResponse{
    openWeatherForecast.City.Name,
    tempMinKelvin,
    tempMaxKelvin,
    apiResponseTimeseries,
  }, nil
}
