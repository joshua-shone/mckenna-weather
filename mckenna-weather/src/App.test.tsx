import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

import mockApiResponse from "./mock_api_response.json";

test("displays expected weather info for mock API response", async () => {
  async function fetchForecast() {
    return mockApiResponse;
  }

  render(<App fetchForecast={fetchForecast} locale="en-US" />);

  const cityName = await screen.findByTestId("city-name");
  expect(cityName).toHaveTextContent("Altstadt");

  const weatherCondition = await screen.findByTestId("weather-condition");
  expect(weatherCondition).toHaveTextContent("Rain");

  const currentTemp = await screen.findByTestId("current-temp");
  expect(currentTemp).toHaveTextContent("14°");

  const dayOfWeek = await screen.findByTestId("day-of-week");
  expect(dayOfWeek).toHaveTextContent("Thursday");

  const dayAndMonth = await screen.findByTestId("day-and-month");
  expect(dayAndMonth).toHaveTextContent("February 16");
});

test("shows error modal for bad API response", async () => {
  render(<App apiUrl="http://localhost/invalid-api-url" />);
  const errorModal = await screen.findByTestId("error-modal");
  expect(errorModal).toBeInTheDocument();
});
