import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Order from "./component/Order";
import Current from "./component/Current";
import { RouteOr } from "lucide-react";

function App(){
    return(
        <div>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element = {<Current />}/>
                        <Route path="/menu/:tableNumber" element={<Order />}/>
                    </Routes>
                </BrowserRouter>

        </div>
        
    );

}
export default App;