import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import './interceptors/axios';
import mixpanel from 'mixpanel-browser';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const mixpanelProjectToken = process.env.REACT_APP_DEV === 'true'
    ? process.env.REACT_APP_MIXPANEL_DEV_PROJECT_TOKEN
    : process.env.REACT_APP_MIXPANEL_PROD_PROJECT_TOKEN;

if (mixpanelProjectToken) {
    mixpanel.init(mixpanelProjectToken, {track_pageview: true, persistence: 'localStorage'});
}

root.render(
  <React.StrictMode>
      <BrowserRouter>
          <App />
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
