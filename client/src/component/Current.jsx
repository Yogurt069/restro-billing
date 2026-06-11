import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Current() {
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [totalPrice, setTotalPrice] = useState({});
  const fetchTables = async () => {
    try {
      const response = await fetch(
        "https://restro-billing-yogurt-co.onrender.com/tables"
      );

      const data = await response.json();

      console.log("Tables:", data);

      setTables(data);
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };
  const fetchTableTotalPrice = async () => {
    try {
      const response = await fetch(
        `https://restro-billing-yogurt-co.onrender.com/check-table-status`
      );
      const data = await response.json();
      const priceMap = {};

      data.forEach(item => {
        priceMap[item.table_number] = item.total_cost;
      });

      setTotalPrice(priceMap);
      
      console.log("Total Price:", data);
    } catch (err) {
      console.error(
        `Error fetching total price `,
        err
      );
    }
  }
  const openTable = (tableNumber) => {
    navigate(`/menu/${tableNumber}`);
  };

  useEffect(() => {
    fetchTables();
    fetchTableTotalPrice();
  }, []);

  const changeTheme = () =>{
    const style = document.createElement('style');
    style.type = 'text/css';
    
    // Add the CSS rules as a string
    style.innerHTML = 'body { filter: invert(100%); }';
    
    // Append the style to the document head
    document.head.appendChild(style);
  }
  

  return (
    <div className="orders">
      {/* Navbar */}

      <nav className="navbar">
        <div className="nav-left">
          <Menu
            size={28}
            className="menu-icon"
            onClick={() => changeTheme()}
          />

          <h1>THE MOMO HUB</h1>
        </div>

        <button
          className="order-btn"
          onClick={() => navigate("/records")}
        >
          Bills History
        </button>
        <button
          className="order-btn"
          onClick={() => navigate("/")}
        >
          NEW ORDER
        </button>
      </nav>

      {/* TOP TABLES */}

      <div className="cards-container">
        {tables
          .filter(
            (table) =>
              !String(
                table.table_number
              ).startsWith("P")
          )
          .map((table) => (
            <div
              key={table.table_number}
              onClick={() =>
                openTable(
                  table.table_number
                )
              }
              className={`card ${
                table.status === "AVAILABLE"
                  ? "available-card"
                  : "occupied-card"
              }`}
            >
              <h4>
                {totalPrice[table.table_number] !== undefined
                ? `₹${totalPrice[table.table_number]}`
                : table.table_number}
              </h4>
            </div>
          ))}
      </div>

      {/* Divider */}

      <div className="divider"></div>

      {/* PARCELS */}

      <div className="more-cards">
        {tables
          .filter((table) =>
            String(
              table.table_number
            ).startsWith("P")
          )
          
          .map((table) => (
            <div
              key={table.table_number}
              onClick={() =>
                openTable(
                  table.table_number
                )
              }
              className={`card ${
                table.status === "AVAILABLE"
                  ? "available-card"
                  : "occupied-card"
              }`}
            >
              <h4>
                {totalPrice[table.table_number] !== undefined
                ? `₹${totalPrice[table.table_number]}`
                : table.table_number}
              </h4>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Current;

