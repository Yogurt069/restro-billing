import React, {
  useEffect,
  useState
} from "react";

import { Menu }
from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

function Current() {

  const navigate =
    useNavigate();

  const [tables, setTables] =
    useState([]);

  // =====================
  // FETCH TABLES
  // =====================

  const fetchTables = async () => {

    try {

      const response =
        await fetch(
          "http://localhost:5000/tables"
        );

      const data =
        await response.json();

      setTables(data);

    }

    catch (err) {

      console.log(err);

    }

  };

  // =====================
  // OPEN TABLE
  // =====================

  const openTable = (
    tableNumber
  ) => {

    navigate(
      `/menu/${tableNumber}`
    );

  };

  useEffect(() => {

    fetchTables();

  }, []);

  return (

    <div className="orders">

      {/* Navbar */}

      <nav className="navbar">

        <div className="nav-left">

          <Menu
            size={28}
            className="menu-icon"
          />

          <h1>
            THE MOMO HUB
          </h1>

        </div>

        <button
          className="order-btn"
          onClick={() =>
            navigate("/")
          }
        >

          NEW ORDER

        </button>

      </nav>

      {/* Top Cards */}

      <div className="cards-container">

        {tables
          .slice(0, 4)
          .map((table) => (

            <div

              key={
                table.table_number
              }
              onClick={() =>
                  openTable(
                    table.table_number
                  )
                }

              className={`card ${
                table.status ===
                "AVAILABLE"

                  ? "available-card"

                  : "occupied-card"
              }`}
            >

              <h2>
                {
                  table.table_number
                }
              </h2>

              
            </div>

          ))}

      </div>

      {/* Divider */}

      <div className="divider"></div>

      {/* Bottom Cards */}

      <div className="more-cards">

        {tables
          .slice(4)
          .map((table) => (

            <div

              key={
                table.table_number
              }
              onClick={() =>
                  openTable(
                    table.table_number
                  )
                }

              className={`card ${
                table.status ===
                "AVAILABLE"

                  ? "available-card"

                  : "occupied-card"
              }`}
            >

              <h2>
                {
                  table.table_number
                }
              </h2>
            </div>

          ))}

      </div>

    </div>

  );

}

export default Current;