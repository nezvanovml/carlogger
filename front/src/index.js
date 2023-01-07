import React, {useEffect, useState  } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import useToken from './useToken';


import {
  Footer,
  Reports,
  Settings,
  Categories,
  Transactions,
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
          <Routes>
            <Route path="/" element={<Transactions token={token} />} />
            <Route path="/settings" element={<Settings token={token} />} />
            <Route path="/categories" element={<Categories token={token} />} />
            <Route path="/reports" element={<Reports token={token} />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    );
 }

ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.unregister();
