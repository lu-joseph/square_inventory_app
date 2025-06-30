import React, { useState } from "react"; // Add useState
import CategoryDropdown from "../CategoryDropdown";
import CartList from "../CartList";
import { Category, InventoryItem } from "../../types";

export default function CheckoutPage(
    props: {
        itemQuery: string,
        setItemQuery: React.Dispatch<React.SetStateAction<string>>,
        items: InventoryItem[],
        setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>,
        currentLocation: string,
        setError: (value: React.SetStateAction<string>) => void
}) {
    // const [localInput, setLocalInput] = useState("");
    // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === "Enter" && localInput.trim() !== "") {
    //         const newItem: InventoryItem = {
    //             // create new Item or find existing one and add?
    //         };
    //         props.setItems(prev => [...prev, newItem]);
    //     }
    // };
    return (<>
        <h2>Checkout</h2>
        <input 
            type="text" 
            className='form-control' 
            placeholder="Enter item name..." 
            value={props.itemQuery} 
            onChange={(e) => props.setItemQuery(e.target.value)}
            // onChange={(e) => setLocalInput(e.target.value)}
            // onKeyDown={handleKeyDown}
        >
        </input>
        <CartList
            cartItems={props.items}
            setCartItems={props.setItems} />
    </>)    
}