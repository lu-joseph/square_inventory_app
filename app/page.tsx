"use client";
import React, { useEffect, useState } from 'react';
import { generateAuthUrl, getCategoryNames, getLocations, getInventory } from './utils';
import BulkPricePage from './Components/Pages/BulkPricePage';
import { Category, InventoryItem, Location, PageType } from './types';
import PageSelect from './Components/PageSelect';
import InventoryPage from './Components/Pages/InventoryPage';
import OrderPage from './Components/Pages/OrderPage';
import CheckoutPage from './Components/Pages/CheckoutPage';


export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryNames, setCategoryNames] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [page, setPage] = useState<PageType>(PageType.Inventory);

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
    if (isAuthenticated && (page === PageType.Inventory || page === PageType.Price)) {
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
        (page === PageType.Inventory && currentLocation) &&
        <InventoryPage
          itemQuery={itemQuery}
          setItemQuery={setItemQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          items={items}
          setItems={setItems}
          categoryNames={categoryNames}
          currentLocation={currentLocation}
          setError={setError}
        />
      }
      {
        page === PageType.Order &&
        <OrderPage />
      }
      {
        page === PageType.Price && currentLocation &&
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
      {
        (page === PageType.CheckoutPage && currentLocation)&&
        <CheckoutPage
          itemQuery={itemQuery}
          setItemQuery={setItemQuery}
          items={items}
          setItems={setItems}
          currentLocation={currentLocation}
          setError={setError}
        />
      }
    </div>
  );
}
