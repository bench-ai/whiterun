import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./views/login/login";
import Register from "./views/register/register";
import Home from "./views/home/home";

function App() {
  return (
      <div>
          <BrowserRouter>
              <Routes>
                  <Route path={"/"} element={<Home/>}/>
                  <Route path={"/login"} element={<Login/>}/>
                  <Route path={"/register"} element={<Register/>}/>
              </Routes>
          </BrowserRouter>
      </div>

  );
}

export default App;
