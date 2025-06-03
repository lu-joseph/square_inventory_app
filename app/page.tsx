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

type Category = {
  id: string;
  name: string;
}

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryNames, setCategoryNames] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemQuery, setItemQuery] = useState("");

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
      } catch (err) {
        console.log(err);
        setError('Failed to get items');
      }
    };
    getItems();
  }, [])

  useEffect(() => {
    const getCategoryNames = async () => {
      try {
        const res = await fetch('/api/category_names', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const response = await res.json();
        setCategoryNames(response);
      } catch (err) {
        console.log(err);
        setError('Failed to get category names');
      }
    };
    getCategoryNames();

  }, [])

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Inventory</h2>
      <input type="text" className='form-control' placeholder="Enter item name..." onChange={(e) => setItemQuery(e.target.value)}></input>
      <select className="form-select" aria-label="Select reporting category" onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Filter by reporting category</option>
        {categoryNames.map((category) => (
          <option key={category.id} value={category.name}>{category.name}</option>
        ))}
      </select>

      {items
        .filter((item) => item.categories.includes(selectedCategory) || selectedCategory === "")
        .filter((item) => item.name.toLowerCase().includes(itemQuery.toLowerCase()) || itemQuery === "")
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
