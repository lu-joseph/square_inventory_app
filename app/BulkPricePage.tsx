import { useEffect, useRef, useState } from "react"
import { InventoryItem } from "./page"
import ItemList from "./ItemList";
import GetInventory from "./GetInventory";
import { fetchHelper } from "./utils";

export default function BulkPricePage(props: {
    selectedCategory: string,
    itemQuery: string,
    currentLocation: string,
    items: InventoryItem[],
    setItems: (value: React.SetStateAction<InventoryItem[]>) => void,
    setError: (value: React.SetStateAction<string>) => void,
    setItemQuery: (value: React.SetStateAction<string>) => void,
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [outdatedList, setOutdatedList] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleClick = async () => {
        if (!inputRef.current?.value
            || isNaN(parseFloat(inputRef.current.value))
            || !props.selectedCategory)
            return
        const roundedPrice = parseFloat(inputRef.current.value).toFixed(2)
        const priceInCents = parseFloat(roundedPrice) * 100
        const selectedItems = props.items.filter((item) => item.categories?.includes(props.selectedCategory))
        setLoading(true);
        try {
            const res = await fetchHelper('/api/catalog/bulk_change_price', 'POST', JSON.stringify({
                changes: selectedItems.map((item) => ({
                    objectId: item.itemId,
                    newPrice: priceInCents.toString()
                }))
            }))
            await res.json().then(() => { setOutdatedList(true); setLoading(false) });
        } catch (err) {
            console.log("Error:", err)
        }
    }

    const handleClickRefresh = async () => {
        props.setItems([]);
        GetInventory({ currentLocation: props.currentLocation, setItems: props.setItems, setError: props.setError });
        setOutdatedList(false);
    }
    return (<>
        {outdatedList && <div>List outdated; refresh to see updates</div>}
        <button type="button" className="btn btn-primary mt-1" onClick={() => handleClickRefresh()}>Refresh list</button>

        <div className="input-group mb-3 d-flex flex-row justify-content-start">
            <div style={{ width: "10%" }}>
                <input ref={inputRef} type="text" className="form-control" placeholder="" />
            </div>
            <div className="input-group-append">
                <button className="btn btn-outline-secondary" onClick={() => { handleClick() }} >Update</button>
            </div>
            {
                loading &&
                <div className="intput-group-append px-2">
                    <span className="loader"></span>
                </div>
            }
        </div>
        {
            props.items && props.selectedCategory &&
            <ItemList
                items={props.items}
                selectedCategory={props.selectedCategory}
                itemQuery={props.itemQuery}
                currentLocation={props.currentLocation}
                setItems={props.setItems}
                setError={props.setError}
                setItemQuery={props.setItemQuery} />
        }
    </>)
}