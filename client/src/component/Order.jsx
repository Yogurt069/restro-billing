import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useParams} from "react-router-dom";
import BillItems from "./BillItems";
import Modal from "./Modal"
function Order() {

  // =========================
  // STATES
  // =========================
  
  const [categories, setCategories] =
    useState([]);
  const [tables, setTables] =
  useState([]);
  const [parcel, setParcel] =
    useState(false);
  const [foods, setFoods] =
    useState([]);
    
    const [foodOptions, setFoodOptions] =
    useState([]);
    
  const [selectedCategory, setSelectedCategory] =
  useState("");
  const [selectedCategoryName, setSelectedCategoryName] =
    useState("");

    const [billItems, setBillItems] =
    useState([]);
    
    const [selectedFood, setSelectedFood] =
    useState(null);
    
    const [showModal, setShowModal] =
    useState(false);
    
    const [currentOptions, setCurrentOptions] =
    useState([]);
    
    const [addFoodOption, setAddFoodOption] =
    useState(null);
    
    const [selectedOptionBtn, setSelectedOptionBtn] =
    useState("");
    
    const [quantity, setQuantity] =
    useState(1);
    const [customerName, setCustomerName] = useState("");
    const [showConfirm, setShowConfirm] =useState(false);

    const [description, setDescription] =useState("");
    const [transferTable,setTransferTable] = useState("");
    
    const navigate = useNavigate();
    
    const { tableNumber } = useParams();
    // =========================
    // FETCH DATA
    // =========================
    
  const fetchData = async () => {

    try {

      // =====================
      // TABLES
      // =====================

      const tablesRes =
        await fetch(
          "https://restro-billing-yogurt-co.onrender.com/tables"
        );

      const tablesData =
        await tablesRes.json();

      setTables(tablesData);

      // =====================
      // CATEGORIES
      // =====================

      const categoriesRes =
        await fetch(
          "https://restro-billing-yogurt-co.onrender.com/categories"
        );

      const categoriesData =
        await categoriesRes.json();

      setCategories(categoriesData);

      if (
        categoriesData.length > 0
      ) {

        setSelectedCategory(
          categoriesData[0]
            .category_id
        );

        setSelectedCategoryName(
          categoriesData[0]
            .category_name
        );

      }

      // =====================
      // FOODS
      // =====================

      const foodsRes =
        await fetch(
          "https://restro-billing-yogurt-co.onrender.com/foods"
        );

      const foodsData =
        await foodsRes.json();

      setFoods(foodsData);

      // =====================
      // FOOD OPTIONS
      // =====================

      const foodOptionsRes =
        await fetch(
          "https://restro-billing-yogurt-co.onrender.com/food-options"
        );

      const foodOptionsData =
        await foodOptionsRes.json();

      setFoodOptions(
        foodOptionsData
      );

      // =====================
      // EXISTING BILL
      // =====================

      const billRes =
        await fetch(
          `https://restro-billing-yogurt-co.onrender.com/table-orders/${tableNumber}`
        );

      const billData =
        await billRes.json();
        console.log(billData.bill.parcel);
        console.log(typeof billData.bill.parcel);
      console.log("TABLE DATA");
      console.log(billData);
      if (billData.bill) {

        setCustomerName(
          billData.bill.customer_name || ""
        );

        setDescription(
          billData.bill.description || ""
        );

        setParcel(
          billData.bill.parcel === 1
        );

      }

      // =====================
      // EXISTING ORDERS
      // =====================

      const loadedOrders =
        (billData.orders || []).map(
          order => ({

            food_id:
              order.food_id,

            food_name:
              order.food_name,

            option_id:
              order.option_id,

            selectedOption:
              order.option_name || "",

            qty:
              order.quantity,

            price:
              order.unit_price,

            finalPrice:
              order.total_price,

            isNew: false

          })
        );

      setBillItems(
        loadedOrders
      );

    }

    catch (err) {

      console.log(err);

    }

  };

  // =========================
  // USE EFFECT
  // =========================

  useEffect(() => {
    fetchData();

  }, []);

  // =========================
  // FILTER FOODS
  // =========================

  const filteredFoods =
    foods.filter(
      (food) =>
        food.category_id ===
        selectedCategory
    );

  // =========================
  // OPEN FOOD OPTIONS
  // =========================

  const openFoodOptions = (
    food
  ) => {

    setSelectedFood(food);

    setQuantity(1);

    setSelectedOptionBtn("");

    setAddFoodOption(null);

    // =====================
    // FIND OPTIONS
    // =====================

    const options =
      foodOptions.filter(
        (option) =>
          option.category_id ===
          food.category_id
      );

    // =====================
    // SHOW MODAL
    // =====================

    setCurrentOptions(options);

    setShowModal(true);

  };

  // =========================
  // ADD FOOD WITH OPTION
  // =========================

  // =========================
// ADD FOOD WITH OPTION
// =========================

const addFoodWithType = (
  addFoodOption
) => {

  // =====================
  // CHECK OPTION REQUIRED
  // =====================

  if (
    currentOptions.length > 0 &&
    !addFoodOption
  ) {

    alert(
      "Please select an option"
    );

    return;
  }

  // =====================
  // WITHOUT OPTIONS
  // =====================

  if (!addFoodOption) {

    const finalPrice =
      foodPrice(selectedFood)
      * quantity;

    const updatedFood = {
      ...selectedFood,

      selectedOption: addFoodOption
        ? addFoodOption.option_name
        : "",

      option_id: addFoodOption
        ? addFoodOption.option_id
        : null,

      finalPrice,

      qty: quantity,

      isNew: true
    };
      
      setBillItems([
        ...billItems,
      updatedFood
    ]);

    setShowModal(false);

    return;
  }


  // =====================
  // WITH OPTIONS
  // =====================

  const finalPrice =
    (
      foodPrice(selectedFood) +
      addFoodOption.extra_price
    ) * quantity;
    
    const updatedFood = {
  ...selectedFood,
  selectedOption:addFoodOption.option_name,
  option_id:addFoodOption.option_id,
  finalPrice,
  qty: quantity,
  isNew: true
};

  setBillItems([
    ...billItems,
    updatedFood
  ]);

  setShowModal(false);

  setAddFoodOption(null);

};

  // =========================
  // FOOD PRICE HELPER
  // =========================

  const foodPrice = (
    food
  ) => {

    return Number(food.price);

  };

  // =========================
  // TOTAL
  // =========================

  const totalPrice =
    billItems.reduce(
      (acc, item) =>
        acc +
        (
          item.finalPrice ||
          item.price
        ),
      0
    );
    const generateBill = async () => {

      try {

        const response =
          await fetch(
            "https://restro-billing-yogurt-co.onrender.com/bill",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                tableNumber,
                customerName,
                description,
                parcel,
                items: billItems

              })
            }
          );

        const data = await response.json();

        console.log(data);

     

        navigate("/");

      }

      catch (err) {

        console.log(err);

      }

    };
    const sendKOT = async () => {

      try {

        const newItems =
          billItems.filter(
            item => item.isNew
          );


        const response =
          await fetch(
            "https://restro-billing-yogurt-co.onrender.com/kot",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                tableNumber,
                transferTable,
                customerName,
                parcel,
                description,
                items: newItems
              })

            }
          );

        const data =
          await response.json();

        console.log(data);

        if (data.success) {

          setBillItems(prev =>
            prev.map(item => ({
              ...item,
              isNew: false
            }))
          );

        

        }
        navigate("/");

      }

      catch (err) {

        console.log(err);

      }

    };
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

      {/* =====================
          NAVBAR
      ===================== */}

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

      {/* =====================
          MAIN LAYOUT
      ===================== */}

      <div className="main-layout">

        {/* =====================
            CATEGORIES
        ===================== */}

        <div className="categories">

          {categories.map(
            (category) => (

              <div
                key={
                  category.category_id
                }

                className={`category ${
                  selectedCategoryName ===
                  category.category_name
                    ? "active-category"
                    : ""
                }`}

                onClick={() =>{
                  setSelectedCategory(
                    category.category_id
                  )
                  setSelectedCategoryName(category.category_name)
                }
                }
              >

                {
                  category.category_name
                }

              </div>

            )
          )}

        </div>

        {/* =====================
            FOOD SECTION
        ===================== */}

        <div className="food-section">

          <h2 className="section-title">

            {selectedCategoryName}

          </h2>

          <div className="food-grid">

            {filteredFoods.map(
              (food) => (

                <div
                  className="food-card"

                  key={
                    food.food_id
                  }

                  onClick={() =>
                    openFoodOptions(
                      food
                    )
                  }
                >

                  <div className="food-content">

                    <div className="title-price">

                      <h3>
                        {
                          food.food_name
                        }
                      </h3>

                      <span>

                        ₹
                        {food.price}

                      </span>

                    </div>

                    <div className="food-line"></div>

                    <p className="food-para">

                      {
                        food.food_description
                      }

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* =====================
            BILL SECTION
        ===================== */}

        <div className="bill-section">

          <h2 className="bill-title">
            TOTAL BILL
          </h2>

          {/* TOP */}

          <div className="bill-top">

            <div className="bill-info">

              <h3>
                TABLE NO :
                {" "}
                {tableNumber}
              </h3>

              <div className="parcel-box">

                <h3>
                  PARCEL :
                </h3>

                <select
                  className="transfer-select"
                  value={parcel ? "true" : "false"}
                  onChange={(e) =>
                    setParcel(
                      e.target.value === "true"
                    )
                  }>
                  <option value="false">
                    NO
                  </option>

                  <option value="true">
                    YES
                  </option>
                </select>              
              </div>

            </div>

            <div className="bill-name-transfer">

              <input
                type="text"
                placeholder="Customer Name"
                className="bill-input"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
              />

              <select
                className="transfer-select"
                value={transferTable}
                onChange={(e) =>
                  setTransferTable(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Transfer To
                </option>

                {tables
                  .filter(
                    table =>
                      table.status ===
                        "AVAILABLE" &&
                      table.table_number !==
                        tableNumber
                  )
                  .map(table => (

                    <option
                      key={
                        table.table_number
                      }
                      value={
                        table.table_number
                      }
                    >

                      {
                        table.table_number
                      }

                    </option>

                  ))}

              </select>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="description-box">

            <label>
              DESCRIPTION
            </label>

            <textarea
              placeholder="Optional description..."
              className="description-input"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

          </div>

          {/* BILL TABLE */}

          <div className="bill-table">

            <div className="bill-table-head">

              <span>SR.</span>
              <span>NAME</span>
              <span>QTY</span>
              <span>PRICE</span>

            </div>
            <BillItems billItems={billItems} />

          </div>

          {/* TOTAL */}

          <div className="bill-total">

            <h3>
              TOTAL
            </h3>

            <h3>
              ₹{totalPrice}
            </h3>

          </div>

          {/* BUTTONS */}

          <div className="bill-buttons">

            <button onClick={sendKOT}>
              KOT
            </button>

            <button>
              KOT & PRINT
            </button>
            <button>
              BILL & PRINT
            </button>

            <button
              onClick={() =>
                setShowConfirm(true)
              }>
              BILL
            </button>


          </div>

        </div>

      </div>

      {/* =====================
          MODAL
      ===================== */}

      {showModal && (
        <Modal
          selectedFood={selectedFood}
          currentOptions={currentOptions}
          quantity={quantity}
          setQuantity={setQuantity}
          selectedOptionBtn={selectedOptionBtn}
          setSelectedOptionBtn={setSelectedOptionBtn}
          addFoodOption={addFoodOption}
          setAddFoodOption={setAddFoodOption}
          addFoodWithType={addFoodWithType}
          setShowModal={setShowModal}
        />

      )}

      {showConfirm && (

        <div className="modal-overlay">

          <div className="confirm-modal">

            <h2>
              Generate Bill?
            </h2>

            <p>
              Are you sure you want
              to generate the bill?
              This will close the
              table and mark it as
              available.
            </p>

            <div className="confirm-buttons">

              <button
                className="confirm-yes"
                onClick={() => {

                  setShowConfirm(
                    false
                  );

                  generateBill();

                }}
              >
                YES
              </button>

              <button
                className="confirm-no"
                onClick={() =>
                  setShowConfirm(
                    false
                  )
                }
              >
                CANCEL
              </button>

            </div>

          </div>

        </div>

      )}
    </div>
  );
}
export default Order;