import React from "react";
import CategoryDropdown from "../CategoryDropdown";
import ItemList from "../ItemList";
import { Category, InventoryItem } from "../../types";

export default function InventoryPage(
    props: {
        itemQuery: string,
        setItemQuery: React.Dispatch<React.SetStateAction<string>>,
        selectedCategory: string,
        setSelectedCategory: React.Dispatch<React.SetStateAction<string>>,
        items: InventoryItem[],
        setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>,
        categoryNames: Category[],
        currentLocation: string,
        setError: (value: React.SetStateAction<string>) => void
    }) {
    return (<>
        <h2>Inventory</h2>
        <input type="text" className='form-control' placeholder="Enter item name..." value={props.itemQuery} onChange={(e) => props.setItemQuery(e.target.value)}></input>
        <CategoryDropdown setSelectedCategory={props.setSelectedCategory} categoryNames={props.categoryNames} />
        <ItemList
            items={props.items}
            selectedCategory={props.selectedCategory}
            itemQuery={props.itemQuery}
            currentLocation={props.currentLocation}
            setItems={props.setItems}
            setError={props.setError}
            setItemQuery={props.setItemQuery} />
    </>)
}