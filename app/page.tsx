"use client";
import React, { useEffect, useState } from 'react';

type Variation = {
  name: string;
  sku: string;
  variationId: string;
  stock: number;
};

type InventoryItem = {
  itemId: string;
  name: string;
  variations: Variation[];
  categories: string[];
};

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [error, setError] = useState('');

  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await fetch('/api/catalog/list', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const response = await res.json();
        setItems(response);
        console.log('setting response to ', response);
      } catch (err) {
        console.log(err);
        setError('Failed to get items');
      }
    };
    getItems();
  }, [])


  return (
    <div style={{ padding: "1rem" }}>
      <h2>Inventory</h2>

      {items
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
            <p>Categories: {item.categories.join(", ")}</p>
            {item.variations.map((variation) => (
              <div key={variation.variationId} style={{ marginBottom: "0.5rem" }}>
                <strong>{variation.name || 'Regular'} (sku: {variation.sku || '-'})</strong>: {variation.stock || 0}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
