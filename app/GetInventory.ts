import { InventoryItem } from "./page";

export default async function GetInventory({
    currentLocation,
    setItems,
    setError,
}: {
    currentLocation: string,
    setItems: (value: React.SetStateAction<InventoryItem[]>) => void,
    setError: (value: React.SetStateAction<string>) => void

}) {
    try {
        const res = await fetch(`/api/catalog/list?token=${localStorage.getItem('square_access_token')}&location=${currentLocation}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const response = await res.json();
        if (res.status === 500 || !response) {
            setError("Error")
        } else {
            setItems(response);
        }
    } catch (err) {
        console.log(err);
        setError('Failed to get items');
    }
} 