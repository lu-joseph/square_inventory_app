import { useRef } from 'react';
import { InventoryItem, type Variation } from './page';
import GetInventory from './GetInventory';

export default function VariationInfo(props: {
    variation: Variation,
    locationId: string,
    setItems: (value: React.SetStateAction<InventoryItem[]>) => void,
    setError: (value: React.SetStateAction<string>) => void
}) {

    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = async () => {
        if (inputRef.current?.value && !isNaN(parseInt(inputRef.current.value))) {
            try {
                fetch(`/api/inventory/batch_change?token=${localStorage.getItem('square_access_token')}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        changes: [
                            {
                                catalogObjectId: props.variation.variationId,
                                quantity: inputRef.current.value,
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
            inputRef.current.value = "";
            props.setItems([]);

            GetInventory({ currentLocation: props.locationId, setItems: props.setItems, setError: props.setError })
        }
    }


    return (<>
        <div style={{ marginBottom: "0.5rem" }}>
            <strong>{props.variation.name || 'Regular'} (sku: {props.variation.sku || '-'})</strong>: {props.variation.stock || 0}
        </div>
        <div className="input-group mb-3">
            <input ref={inputRef} type="text" className="form-control" placeholder="New quantity" />
            <div className="input-group-append">
                <button className="btn btn-outline-secondary" onClick={() => { handleClick() }} >Update</button>
            </div>
        </div>
    </>)
}