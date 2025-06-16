
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
