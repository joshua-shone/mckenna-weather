import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {Forecast} from './types';

async function fetchForecast() {
  const response = await fetch('http://localhost:8080/api');
  return await response.json() as Forecast;
}

ReactDOM.render(
  <React.StrictMode>
    <App fetchForecast={fetchForecast} locale={navigator.language} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
