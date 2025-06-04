import { InventoryItem } from "./page";


export default function CatalogObjectCard(props: { item: InventoryItem, location: string }) {
    return (
        <>
            <div key={props.item.itemId} style={{
                border: "1px solid #ccc",
                marginBottom: "1rem",
                padding: "0.5rem",
                borderRadius: "6px",
            }}>
                <h3 >
                    {props.item.name}
                </h3>
                <p>Categories: {props.item.categories?.join(", ")}</p>
                {props.item.variations?.map((variation) => (
                    <div key={variation.variationId}>

                    </div>
                ))}
            </div>
        </>
    );
}