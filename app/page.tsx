"use client";
import React, { useEffect, useState } from 'react';
import crypto from 'crypto';
import process from 'process';

type Variation = {
  name: string;
  sku: string;
  variationId: string;
  stock: number;
};

type InventoryItem = {
  itemId: string;
  name: string;
  variations?: Variation[];
  categories?: string[];
};

type Category = {
  id: string;
  name: string;
}

enum Page {
  Inventory = 0,
  Order,
}

type Location = {
  id: string;
  name: string;
}

const getAuthUrlValues = () => {
  const base64Encode = (str: Buffer) => {
    return str.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const codeVerifier = base64Encode(crypto.randomBytes(32))

  const sha256 = (buffer: string) => {
    return crypto.createHash('sha256').update(buffer).digest()
  }
  const codeChallenge = base64Encode(sha256(codeVerifier))

  // Set the code verifier and state in local storage so we can check it later
  const squareCodeVerifier = codeVerifier
  return {
    squareCodeChallenge: codeChallenge,
    squareCodeVerifier,
    baseURl: process.env.NEXT_PUBLIC_SQUARE_BASE_URL,
    appId: process.env.NEXT_PUBLIC_APP_ID,
  }
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
      const getLocations = async () => {
        try {
          const res = await fetch(`/api/get_locations?token=${localStorage.getItem('square_access_token')}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const response = await res.json();
          console.log(response);
          if (res.status !== 500)
            setLocations(response);
        } catch (err) {
          console.log(err);
          setError('Failed to get locations');
        }
      }
      getLocations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentLocation !== "") {
      const getItems = async () => {
        try {
          const res = await fetch(`/api/catalog/list?token=${localStorage.getItem('square_access_token')}&location=${currentLocation}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const response = await res.json();
          console.log(response);
          if (res.status !== 500)
            setItems(response.items);

        } catch (err) {
          console.log(err);
          setError('Failed to get items');
        }
      };
      getItems();
    }
  }, [isAuthenticated, currentLocation])

  useEffect(() => {
    if (isAuthenticated) {
      const getCategoryNames = async () => {
        try {
          const res = await fetch(`/api/category_names?token=${localStorage.getItem('square_access_token')}`, {
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

    }
  }, [isAuthenticated])

  const generateAuthUrl = () => {
    const {
      squareCodeChallenge,
      squareCodeVerifier,
      baseURl,
      appId,
    } = getAuthUrlValues();

    // Store for later
    localStorage.setItem('square_code_verifier', squareCodeVerifier);
    const scopes = ["INVENTORY_READ", "ITEMS_READ", "MERCHANT_PROFILE_READ"];

    return `${baseURl}/oauth2/authorize?client_id=${appId}&scope=${scopes.join("+")}&session=false&code_challenge=${squareCodeChallenge}`;

  }

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
      fetch('/api/square_token_exchange', {
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

  return (
    <div style={{ padding: "1rem" }}>
      <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" className="btn-check" name="btnradio" id="btnradio1" value="Inventory"
          checked={page === Page.Inventory}
          onChange={() => setPage(Page.Inventory)}
        ></input>
        <label className="btn btn-outline-primary" htmlFor="btnradio1">Inventory</label>

        <input type="radio" className="btn-check" name="btnradio" id="btnradio2" value="Order"
          checked={page === Page.Order}
          onChange={() => { setPage(Page.Order) }}
        ></input>
        <label className="btn btn-outline-primary" htmlFor="btnradio2">Cash order</label>
      </div>
      <select className="form-select" aria-label="Select location" onChange={(e) => setCurrentLocation(e.target.value)}>
        <option value="">Select location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>{location.name}</option>
        ))}
      </select>
      {
        page === Page.Inventory &&
        (<div>
          <h2>Inventory</h2>
          <input type="text" className='form-control' placeholder="Enter item name..." onChange={(e) => setItemQuery(e.target.value)}></input>
          <select className="form-select" aria-label="Select reporting category" onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Filter by reporting category</option>
            {categoryNames.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>

          {items
            .filter((item) => item.categories?.includes(selectedCategory) || selectedCategory === "")
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
                <p>Categories: {item.categories?.join(", ")}</p>
                {item.variations?.map((variation) => (
                  <div key={variation.variationId} style={{ marginBottom: "0.5rem" }}>
                    <strong>{variation.name || 'Regular'} (sku: {variation.sku || '-'})</strong>: {variation.stock || 0}
                  </div>
                ))}
              </div>
            ))}
        </div>)
      }
      {
        page === Page.Order &&
        (<div>
          order page
        </div>)
      }
    </div>
  );
}
