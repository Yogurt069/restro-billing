import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Records() {
  const [billData, setBillData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://restro-billing-yogurt-co.onrender.com/bill-records"
      );

      const data = await response.json();

      setBillData(data.billDetails);
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate("/");
    const changeTheme = () =>{
    const style = document.createElement('style');
    style.type = 'text/css';
    
    // Add the CSS rules as a string
    style.innerHTML = 'body { filter: invert(100%); }';
    
    // Append the style to the document head
    document.head.appendChild(style);
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-content">
        <h2>Loading records...</h2>
      </div>
    );
  }

  return (
    <div className="page-content">
        <nav className="navbar">
        <div className="nav-left">
          <Menu
            size={28}
            className="menu-icon"
            onClick={() => changeTheme()}
          />

          <h1>Bill Records</h1>
        </div>
        <button
          className="order-btn"
          onClick={() => navigate("/")}
        >
          NEW ORDER
        </button>
      </nav>

      <div className="records-list">
        {billData.map((bill) => (
          <div
            key={bill.bill_id}
            className="record-card"
          >
            <button
              className="record-header"
              onClick={() =>
                setExpanded(
                  expanded === bill.bill_id
                    ? null
                    : bill.bill_id
                )
              }
            >
              <div className="record-left">
                <div className="bill-id">
                  Bill #{bill.bill_id}
                </div>

                <div className="table-number">
                  Table {bill.table_number}
                </div>
              </div>

              <div className="record-right">
                <span className="record-total">
                  ₹{bill.total_cost}
                </span>

                <span
                  className={`status-badge ${
                    bill.status === "ACTIVE"
                      ? "status-active"
                      : "status-paid"
                  }`}
                >
                  {bill.status}
                </span>

                {expanded === bill.bill_id ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </div>
            </button>

            {expanded === bill.bill_id && (
              <div className="record-details">
                <div className="bill-info-grid">
                    <div className="bill-info-item">
                        Customer: {bill.customer_name || "Walk-in"}
                    </div>

                    <div className="bill-info-item">
                        Payment: {bill.cash ? "Cash" : "Online"}
                    </div>

                    <div className="bill-info-item">
                        Parcel: {bill.parcel ? "Yes" : "No"}
                    </div>

                    <div className="bill-info-item">
                        {bill.description || "No description"}
                    </div>
                </div>
                <div className="orders-section">
                  <h4 className="order-title">Orders</h4>

                  {bill.orders &&
                  bill.orders.length > 0 &&
                  bill.orders[0].order_id !== null ? (
                    bill.orders.map((order) => (
                      <div
                        key={order.order_id}
                        className="order-row"
                      >
                        <div>
                          <div className="food-name">
                            {order.food_name}
                          </div>

                          <div className="food-option">
                            {order.option_name}
                          </div>
                        </div>

                        <div className="order-right">
                        <div>₹{order.total_price}</div>
                        <div className="order-qty">
                            Qty: {order.quantity}
                        </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-orders">
                      No orders found
                    </p>
                  )}
                </div>

                <div className="bill-footer">
                  Total: ₹{bill.total_cost}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Records;