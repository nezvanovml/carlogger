import React from "react";
import { NavLink  } from "react-router-dom";

function Navigation() {



    return (
        <div className="navigation">
          <nav className="navbar navbar-expand navbar-dark bg-dark">
            <div className="container">
              <div>
                <ul className="navbar-nav ">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/">
                      Отчёты
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/transactions">
                      Транзакции
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/categories">
                      Категории
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/settings">
                      Настройки
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
    );
}

export default Navigation;
