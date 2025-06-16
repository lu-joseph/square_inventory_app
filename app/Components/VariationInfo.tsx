import { useRef } from 'react';
import { type InventoryItem, type Variation } from '../types';
import { getInventory } from '../utils';

export default function VariationInfo(props: {
    variation: Variation,
    locationId: string,
    setItems: (value: React.SetStateAction<InventoryItem[]>) => void,
    setError: (value: React.SetStateAction<string>) => void,
    setItemQuery: (value: React.SetStateAction<string>) => void,
}) {

    const quantityInputRef = useRef<HTMLInputElement>(null);
    const priceInputRef = useRef<HTMLInputElement>(null);

    const handleInventoryUpdateClick = async () => {
        if (quantityInputRef.current?.value && !isNaN(parseInt(quantityInputRef.current.value))) {
            try {
                fetch(`/api/square/inventory/batch_change?token=${localStorage.getItem('square_access_token')}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        changes: [
                            {
                                catalogObjectId: props.variation.variationId,
                                quantity: quantityInputRef.current.value,
                                locationId: props.locationId,
                            }
                        ]
                    }),
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log("success, data:", data)
                    })
                    .catch(err => {
                        console.log("failed to update inventory", err);
                    })
            } catch (err) {
                console.log(err);
            }
            quantityInputRef.current.value = "";
            props.setItems([]);
            props.setItemQuery("");

            getInventory({ currentLocation: props.locationId, setItems: props.setItems, setError: props.setError })
        }
    }

    const handlePriceUpdateclick = async () => {

    }


    return (<>
        <div style={{ marginBottom: "0.5rem" }}>
            <div>
                <strong>{props.variation.name || 'Regular'}:</strong>
                {props.variation.sku ? " SKU " + props.variation.sku : ''}
            </div>
            <div className="input-group mb-3 d-flex flex-row justify-content-start">
                <div className="d-flex flex-column justify-content-center mx-3">
                    Quantity: {props.variation.stock || 0}
                </div>
                <div style={{ width: "10%" }}>
                    <input ref={quantityInputRef} type="text" className="form-control" placeholder="" />
                </div>
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" onClick={() => { handleInventoryUpdateClick() }} >Update</button>
                </div>
            </div>
            {!!props.variation.price &&
                <div className="input-group mb-3 d-flex flex-row justify-content-start">
                    <div className="d-flex flex-column justify-content-center mx-3">
                        Price: ${(parseFloat(props.variation.price) / 100.0).toFixed(2)}
                    </div>
                    <div style={{ width: "10%" }}>
                        <input ref={priceInputRef} type="text" className="form-control" placeholder="" />
                    </div>
                    <div className="input-group-append">
                        <button className="btn btn-outline-secondary" onClick={() => { handlePriceUpdateclick() }} >Update</button>
                    </div>
                </div>}
        </div>

    </>)
}