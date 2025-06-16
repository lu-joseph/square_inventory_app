import { InventoryItem } from "../types";
import VariationInfo from "./VariationInfo";

export default function ItemList(props: {
    items: InventoryItem[],
    selectedCategory: string,
    itemQuery: string,
    currentLocation: string,
    setItems: (value: React.SetStateAction<InventoryItem[]>) => void,
    setError: (value: React.SetStateAction<string>) => void,
    setItemQuery: (value: React.SetStateAction<string>) => void,
}) {

    return (<>
        {props.items.length > 0
            ? props.items
                .filter((item) => item.categories?.includes(props.selectedCategory) || props.selectedCategory === "")
                .filter((item) => item.name.toLowerCase().includes(props.itemQuery.toLowerCase()) || props.itemQuery === "")
                .map((item) => (
                    <div key={item.itemId} style={{
                        border: "1px solid #ccc",
                        marginBottom: "1rem",
                        padding: "0.5rem",
                        borderRadius: "6px",
                    }}>
                        <h3 >
                            {item.name}
                        </h3>
                        <p>Categories: {item.categories?.join(", ")}</p>
                        {item.variations?.map((variation) => (
                            <div key={variation.variationId}>
                                <VariationInfo variation={variation} locationId={props.currentLocation} setItems={props.setItems} setError={props.setError} setItemQuery={props.setItemQuery} />
                            </div>
                        ))}
                    </div>
                ))
            : <div>Loading inventory...</div>
        }
    </>)
}