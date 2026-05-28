import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useParams} from "react-router-dom";
function Order() {

  // =========================
  // STATES
  // =========================
  
  const [categories, setCategories] =
    useState([]);

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
    
    const navigate = useNavigate();
    
    const { tableNumber } = useParams();
    // =========================
    // FETCH DATA
    // =========================
    
  const fetchData = async () => {

    try {

      // =====================
      // CATEGORIES
      // =====================

      const categoriesRes =
        await fetch(
          "http://localhost:5000/categories"
        );

      const categoriesData =
        await categoriesRes.json();

      setCategories(categoriesData);

      // Default selected category

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
        )
      }

      // =====================
      // FOODS
      // =====================

      const foodsRes =
        await fetch(
          "http://localhost:5000/foods"
        );

      const foodsData =
        await foodsRes.json();

      setFoods(foodsData);
      

      // =====================
      // FOOD OPTIONS
      // =====================

      const foodOptionsRes =
        await fetch(
          "http://localhost:5000/food-options"
        );

      const foodOptionsData =
        await foodOptionsRes.json();

      setFoodOptions(
        foodOptionsData
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

      selectedOption: "",

      option_id: null,

      finalPrice,

      qty: quantity
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
  
      selectedOption:
        addFoodOption.option_name,
  
      option_id:
        addFoodOption.option_id,
  
      finalPrice,
  
      qty: quantity
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
    const saveBill = async () => {

      try {

        const response =
          await fetch(
            "http://localhost:5000/bills",
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body: JSON.stringify({

                table_number:
                  tableNumber,

                customer_name:
                  "",

                description:
                  "",

                parcel: false,

                total_cost:
                  totalPrice,

                items: billItems

              })

            }
          );

        const data =
          await response.json();

        console.log(data);

        alert(
          "Bill Saved"
        );
        navigate("/");

      }

      catch (err) {

        console.log(err);

      }

    };

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

              <h3>
                PARCEL : NO
              </h3>

            </div>

            <div className="bill-name-transfer">

              <select className="transfer-select">

                <option>
                  TRANSFER
                </option>

                <option>
                  Table 2
                </option>

                <option>
                  Table 3
                </option>

              </select>

              <input
                type="text"
                placeholder="Customer Name"
                className="bill-input"
              />

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
            ></textarea>

          </div>

          {/* BILL TABLE */}

          <div className="bill-table">

            <div className="bill-table-head">

              <span>SR.</span>
              <span>NAME</span>
              <span>QTY</span>
              <span>PRICE</span>

            </div>

            <div className="bill-items">

              {billItems.map(
                (item, index) => (

                  <div
                    className="bill-row"
                    key={index}
                  >

                    <span>
                      {index + 1}
                    </span>

                    <span>

                      {item.food_name}

                      {item.selectedOption
                        ? ` (${item.selectedOption})`
                        : ``
                      }

                    </span>

                    <span>
                      {item.qty}
                    </span>

                    <span>

                      ₹

                      {
                        item.finalPrice
                      }

                    </span>

                  </div>

                )
              )}

            </div>

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

            <button>
              BILL & PRINT
            </button>

            <button onClick={saveBill}>
              BILL
            </button>

            <button>
              KOT
            </button>

            <button>
              KOT & PRINT
            </button>

          </div>

        </div>

      </div>

      {/* =====================
          MODAL
      ===================== */}

      {showModal && (

        <div className="modal-overlay">

          <div className="food-modal">

            <h2>

              {
                selectedFood.food_name
              }

            </h2>

            {/* OPTIONS */}

            <div className="food-options">

              {currentOptions.map(
                (
                  option,
                  index
                ) => (

                  <button
                    key={index}

                    className={`option-btn ${
                      selectedOptionBtn ===
                      option.option_name
                        ? "active-option"
                        : ""
                    }`}

                    onClick={() => {

                      setSelectedOptionBtn(
                        option.option_name
                      );

                      setAddFoodOption(
                        option
                      );

                    }}
                  >

                    {
                      option.option_name
                    }

                    <br />

                    {option.extra_price > 0 &&
                      `(+₹${option.extra_price})`
                    }

                  </button>

                )
              )}

            </div>

            {/* QUANTITY */}

            <div className="quantity-box">

              <button
                onClick={() =>
                  quantity > 1 &&
                  setQuantity(
                    quantity - 1
                  )
                }
              >
                -
              </button>

              <span>
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(
                    quantity + 1
                  )
                }
              >
                +
              </button>
            </div>

            {/* BUTTONS */}
            <button
              className="close-btn"
              onClick={() =>
                addFoodWithType(
                  addFoodOption
                )
              }
            >
              ORDER
            </button>
            <button
              className="close-btn"
              onClick={() =>
                setShowModal(false)
              }
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Order;