import { NextResponse } from 'next/server';
import { Square, SquareClient } from 'square';
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
        const { data } = await client.catalog.list({
            types: 'CATEGORY',
        });
        return NextResponse.json(data.map((item: Square.CatalogObjectCategory) => ({ id: item.id, name: item.categoryData?.name })))

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to get category names' }, { status: 500 });
    }

}