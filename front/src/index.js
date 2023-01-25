import React, {useEffect, useState  } from "react";
//import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import useToken from './useToken';
import { createRoot } from 'react-dom/client';


import {
  Header,
  Garage,
  Spents,
  Settings,
  Login
} from "./components";



function App() {
    const { token, setToken } = useToken();

     if(!token) {
         return <Login setToken={setToken} />
     }



    return (
      <Router>
        <main className="flex-shrink-0">
          <Header />
          <Routes>
            <Route path="/" element={<Garage token={token} />} />
            <Route path="/spents" element={<Spents token={token} />} />
            <Route path="/settings" element={<Settings token={token} />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </Router>
    );
 }

//ReactDOM.render(<App />, document.getElementById("root"));
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

serviceWorker.unregister();
