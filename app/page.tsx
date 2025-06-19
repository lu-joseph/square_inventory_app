"use client";
import React, { useEffect, useState } from 'react';
import { generateAuthUrl, getCategoryNames, getLocations, getInventory } from './utils';
import CategoryDropdown from './Components/CategoryDropdown';
import BulkPricePage from './Components/BulkPricePage';
import ItemList from './Components/ItemList';
import { Category, InventoryItem, Location } from './types';
import PageSelect from './Components/PageSelect';

export enum Page {
  Inventory = 0,
  Order,
  Price,
}


export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryNames, setCategoryNames] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [page, setPage] = useState<Page>(Page.Inventory);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      getLocations({ setLocations, setError });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentLocation) {
      getInventory({ currentLocation, setItems, setError });
    }
  }, [isAuthenticated, currentLocation])

  useEffect(() => {
    if (isAuthenticated && (page === Page.Inventory || page === Page.Price)) {
      getCategoryNames({ setCategoryNames, setError });
    }
  }, [isAuthenticated, page])


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const verifier = localStorage.getItem('square_code_verifier');

      if (!verifier) {
        console.error("Missing verifier");
        return;
      }

      // Exchange code for token (via your own API)
      fetch('/api/square/token_exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, verifier }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem('square_access_token', data.access_token);
            setIsAuthenticated(true);
            window.history.replaceState({}, document.title, "/"); // clean URL
          }
        })
        .catch(err => {
          console.error("OAuth exchange failed", err);
        });
    } else {
      // You might load token from storage if already logged in
      const token = localStorage.getItem('square_access_token');
      if (token) setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Login</h5>
              </div>
              <div className="modal-body">
                <p>To continue, please sign in with Square.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    window.location.href = generateAuthUrl();
                  }}
                >
                  Sign in with Square
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (locations.length === 0) {
    return (<div>Authenticated; Locations loading...</div>)
  }

  if (error) {
    return (<div>Error: {error}</div>)
  }


  return (
    <div style={{ padding: "1rem" }}>
      <PageSelect
        page={page}
        setPage={setPage}
        setSelectedCategory={setSelectedCategory}
        setCurrentLocation={setCurrentLocation}
        locations={locations} />

      {
        (page === Page.Inventory && currentLocation) &&
        <div>
          <h2>Inventory</h2>
          <input type="text" className='form-control' placeholder="Enter item name..." value={itemQuery} onChange={(e) => setItemQuery(e.target.value)}></input>
          <CategoryDropdown setSelectedCategory={setSelectedCategory} categoryNames={categoryNames} />
          <ItemList
            items={items}
            selectedCategory={selectedCategory}
            itemQuery={itemQuery}
            currentLocation={currentLocation}
            setItems={setItems}
            setError={setError}
            setItemQuery={setItemQuery} />
        </div>
      }
      {
        page === Page.Order &&
        (<div>
          order page
        </div>)
      }
      {
        page === Page.Price && currentLocation &&
        (<div className='mt-2'>
          <BulkPricePage
            selectedCategory={selectedCategory}
            itemQuery={itemQuery}
            items={items}
            categoryNames={categoryNames}
            currentLocation={currentLocation}
            setItems={setItems}
            setError={setError}
            setItemQuery={setItemQuery}
            setSelectedCategory={setSelectedCategory}
          />
        </div>)
      }
    </div>
  );
}
