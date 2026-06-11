import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Order from "./component/Order";
import Current from "./component/Current";
import Records from "./component/Records"
import { RouteOr } from "lucide-react";


function App(){
    return(
        <div>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element = {<Current />}/>
                        <Route path="/records" element = {<Records />}/>
                        <Route path="/menu/:tableNumber" element={<Order />}/>
                    </Routes>
                </BrowserRouter>

        </div>
        
    );

}
export default App;