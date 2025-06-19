import React from "react";
import { Page } from "../page"
import { Location } from "../types";

export default function PageSelect(
    props: {
        page: Page,
        setPage: (newPage: Page) => void,
        setSelectedCategory: React.Dispatch<React.SetStateAction<string>>,
        setCurrentLocation: React.Dispatch<React.SetStateAction<string>>,
        locations: Location[]
    }) {
    const switchPage = (newPage: Page) => {
        props.setPage(newPage);
        props.setSelectedCategory("");
    }
    return (
        <>
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" value="Inventory"
                    checked={props.page === Page.Inventory}
                    onChange={() => switchPage(Page.Inventory)}
                ></input>
                <label className="btn btn-outline-primary" htmlFor="btnradio1">Inventory</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" value="Order"
                    checked={props.page === Page.Order}
                    onChange={() => { switchPage(Page.Order) }}
                ></input>
                <label className="btn btn-outline-primary" htmlFor="btnradio2">Cash order</label>
                <input type="radio" className="btn-check" name="btnradio" id="btnradio3" value="Price"
                    checked={props.page === Page.Price}
                    onChange={() => { switchPage(Page.Price) }}
                ></input>
                <label className="btn btn-outline-primary" htmlFor="btnradio3">Change category price</label>
            </div>
            <select className="form-select mt-2" aria-label="Select location" onChange={(e) => props.setCurrentLocation(e.target.value)}>
                <option value="">Select location</option>
                {props.locations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                ))}
            </select>
        </>
    )
}