import React from "react";
import { NavLink  } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer fixed-bottom">
    <div className="navigation">
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container">

            <ul className="navbar-nav  w-100 justify-content-around">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Транзакции
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/categories">
                  Категории
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/reports">
                  Отчёты
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/settings">
                  Настройки
                </NavLink>
              </li>
            </ul>

        </div>
      </nav>
    </div>
  </footer>
  );
}

export default Footer;
