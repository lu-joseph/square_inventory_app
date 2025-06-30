import React from 'react';
import { InventoryItem, Variation } from "../types"; 

export default function CartList(props: {
    cartItems: InventoryItem[];
    setCartItems: (value: React.SetStateAction<InventoryItem[]>) => void;
}) {

    const handleRemoveItem = (itemIdToRemove: string) => {
        props.setCartItems(prevItems => prevItems.filter(item => item.itemId !== itemIdToRemove));
    };

    const getDisplayPrice = (variation: Variation): string => {
        const priceValue = variation.price;
        // Check if the price is a valid number string
        if (priceValue && !isNaN(parseFloat(priceValue))) {
            // Convert from cents to dollars and format to 2 decimal places
            return `$${(parseFloat(priceValue) / 100).toFixed(2)}`;
        }
        return "N/A";
    };

    return (<>
            {props.cartItems.length > 0
                ? props.cartItems.map((item) => (
                    <div key={item.itemId} style={{
                        border: "1px solid #ccc",
                        marginBottom: "1rem",
                        padding: "0.5rem",
                        borderRadius: "6px",
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>
                                {item.name}
                            </h3>
                            <button
                                onClick={() => handleRemoveItem(item.itemId)}
                                className="btn btn-outline-danger btn-sm"
                                aria-label={`Remove ${item.name} from cart`}
                            >
                                Remove
                            </button>
                        </div>
                        
                        {item.variations?.map((variation) => (
                            <div key={variation.variationId} style={{
                                paddingLeft: '1rem',
                                borderLeft: '2px solid #eee',
                                marginLeft: '0.5rem',
                                marginTop: '0.5rem',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {/* Correctly access the variation's name property */}
                                    <span>{variation.name || 'Variation'}</span>
                                    <span style={{ fontWeight: 'bold' }}>{getDisplayPrice(variation)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))
                : <div className="text-center text-muted p-4 border rounded mt-4">
                    <p className="mb-0">Your cart is empty.</p>
                    <small>Add items using the search bar above.</small>
                  </div>
            }
        </>
    );
}
