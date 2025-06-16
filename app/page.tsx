"use client";
import React, { useEffect, useState } from 'react';
import crypto from 'crypto';
import VariationInfo from './VariationInfo';
import GetInventory from './GetInventory';
import CategoryDropdown from './CategoryDropdown';
import BulkPricePage from './BulkPricePage';
import ItemList from './ItemList';

export type Variation = {
  name: string;
  sku: string;
  variationId: string;
  stock: string;
  price: string;
};

export type InventoryItem = {
  itemId: string;
  name: string;
  variations?: Variation[];
  categories?: string[];
};

export type Category = {
  id: string;
  name: string;
}

enum Page {
  Inventory = 0,
  Order,
  Price,
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
    appId: process.env.APP_ID,
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
    if (isAuthenticated && currentLocation) {
      GetInventory({ currentLocation, setItems, setError });
    }
  }, [isAuthenticated, currentLocation])

  useEffect(() => {
    if (isAuthenticated && (page === Page.Inventory || page === Page.Price)) {
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
  }, [isAuthenticated, page])

  const generateAuthUrl = () => {
    const {
      squareCodeChallenge,
      squareCodeVerifier,
      baseURl,
      appId,
    } = getAuthUrlValues();

    localStorage.setItem('square_code_verifier', squareCodeVerifier);
    const scopes = ["INVENTORY_READ", "INVENTORY_WRITE", "ITEMS_READ", "ITEMS_WRITE", "MERCHANT_PROFILE_READ"];

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

  if (locations.length === 0) {
    return (<div>Authenticated; Locations loading...</div>)
  }

  if (error) {
    return (<div>Error: {error}</div>)
  }

  const switchPage = (newPage: Page) => {
    setPage(newPage);
    setSelectedCategory("");
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" className="btn-check" name="btnradio" id="btnradio1" value="Inventory"
          checked={page === Page.Inventory}
          onChange={() => switchPage(Page.Inventory)}
        ></input>
        <label className="btn btn-outline-primary" htmlFor="btnradio1">Inventory</label>

        <input type="radio" className="btn-check" name="btnradio" id="btnradio2" value="Order"
          checked={page === Page.Order}
          onChange={() => { switchPage(Page.Order) }}
        ></input>
        <label className="btn btn-outline-primary" htmlFor="btnradio2">Cash order</label>
        <input type="radio" className="btn-check" name="btnradio" id="btnradio3" value="Price"
          checked={page === Page.Price}
          onChange={() => { switchPage(Page.Price) }}
        ></input>
        <label className="btn btn-outline-primary" htmlFor="btnradio3">Change category price</label>
      </div>
      <select className="form-select mt-2" aria-label="Select location" onChange={(e) => setCurrentLocation(e.target.value)}>
        <option value="">Select location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>{location.name}</option>
        ))}
      </select>
      {/* <button type="button" className="btn btn-primary mt-1" onClick={() => { setItems([]); GetInventory({ currentLocation, setItems, setError }) }}>Refresh list</button> */}
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
