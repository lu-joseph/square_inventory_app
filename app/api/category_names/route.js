import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

const client = new SquareClient({
    environment: SquareEnvironment.Production,
    token: process.env.SQUARE_API_KEY,
});

export async function GET() {
    try {
        const { response } = await client.catalog.list({
            types: 'CATEGORY',
        });
        return NextResponse.json(response.objects.map((item) => ({ id: item.id, name: item.categoryData.name })))

    } catch (err) {
        console.error(err);
        return NextResponse.status(500).json({ error: 'Failed to get category names' });
    }

}