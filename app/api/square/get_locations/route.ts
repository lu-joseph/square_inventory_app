import { NextResponse } from 'next/server';
import { SquareClient } from 'square';
import process from 'process';

export async function GET(request: Request) {
    try {
        const urlParams = new URLSearchParams(new URL(request.url).search);
        const token = urlParams.get('token');
        if (!token) {
            return NextResponse.json({ error: "token missing from query params" }, { status: 500 })
        }
        const client = new SquareClient({
            environment: process.env.NEXT_PUBLIC_SQUARE_BASE_URL,
            token: token,
        });
        const response = await client.locations.list();
        return NextResponse.json(response.locations?.map((location) => ({ id: location.id, name: location.name })))

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to get locations' }, { status: 500 });
    }

}