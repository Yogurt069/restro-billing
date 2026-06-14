import React from "react";

function BillItems({billItems}){
    return( 
        <div className="bill-items">
            
            {billItems.map((item,index) =>(
                <div className="bill-row" key={index}>
                    <span>{index + 1}</span>
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
                        ₹ {item.finalPrice}
                    </span>
                </div>
            ))}
        </div>
    )
}
export default BillItems;