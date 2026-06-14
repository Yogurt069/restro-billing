import React, { useState } from "react";

function Modal({
  selectedFood,
  currentOptions,
  quantity,
  setQuantity,
  addFoodOption,
  setAddFoodOption,
  addFoodWithType,
  setShowModal,
}) {
  const [selectedOptionBtn, setSelectedOptionBtn] = useState("");
  return (
    <div className="modal-overlay">
      <div className="food-modal">
        <h2>{selectedFood.food_name}</h2>
        {/* OPTIONS */}
        <div className="food-options">
          {currentOptions.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                selectedOptionBtn === option.option_name ? "active-option" : ""
              }`}
              onClick={() => {
                setSelectedOptionBtn(option.option_name);
                setAddFoodOption(option);
              }}
            >
              {option.option_name}
              <br />
              {option.extra_price > 0 && `(+₹${option.extra_price})`}
            </button>
          ))}
        </div>

        {/* QUANTITY */}

        <div className="quantity-box">
          <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
            -
          </button>

          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>

        {/* BUTTONS */}
        <button
          className="close-btn"
          onClick={() => addFoodWithType(addFoodOption)}
        >
          ORDER
        </button>
        <button className="close-btn" onClick={() => setShowModal(false)}>
          CLOSE
        </button>
      </div>
    </div>
  );
}
export default Modal;
