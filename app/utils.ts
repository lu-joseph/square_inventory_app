import React from "react";
import { Category, InventoryItem, Location } from "./types";
import crypto from 'crypto';

export function filterBigInt(JSONObject: any) {
    return JSON.parse(JSON.stringify({ JSONObject }, (key, value) => { return typeof value === 'bigint' ? value.toString() : value }))
}

export async function fetchHelper(endpoint: string, method: string, body: any) {
    return await fetch(`${endpoint}?token=${localStorage.getItem('square_access_token')}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: body,
    })
}


export async function getInventory({
    currentLocation,
    setItems,
    setError,
}: {
    currentLocation: string,
    setItems: (value: React.SetStateAction<InventoryItem[]>) => void,
    setError: (value: React.SetStateAction<string>) => void

}) {
    try {
        const res = await fetch(`/api/square/catalog/list?token=${localStorage.getItem('square_access_token')}&location=${currentLocation}`, {
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

export async function getLocations({
    setLocations,
    setError,
}: {
    setLocations: React.Dispatch<React.SetStateAction<Location[]>>,
    setError: (value: React.SetStateAction<string>) => void
}) {
    try {
        const res = await fetch(`/api/square/get_locations?token=${localStorage.getItem('square_access_token')}`, {
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

export async function getCategoryNames({
    setCategoryNames,
    setError,
}: {
    setCategoryNames: React.Dispatch<React.SetStateAction<Category[]>>,
    setError: (value: React.SetStateAction<string>) => void
}) {
    try {
        const res = await fetch(`/api/square/category_names?token=${localStorage.getItem('square_access_token')}`, {
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

export function generateAuthUrl() {
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