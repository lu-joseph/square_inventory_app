import { NextResponse } from 'next/server';
import { SquareClient } from 'square';
import process from 'process';


export async function GET(request) {
    try {
        const urlParams = new URLSearchParams(new URL(request.url).search);
        const token = urlParams.get('token');
        if (!token) {
            return NextResponse.json({ error: "token missing from query params" }, { status: 500 })
        }
        const location = urlParams.get('location');
        if (!location) {
            return NextResponse.json({ error: "location missing from query params" }, { status: 500 })
        }
        const client = new SquareClient({
            environment: process.env.NEXT_PUBLIC_SQUARE_BASE_URL,
            token: token,
        });
        const categoryResponse = await client.catalog.list({
            types: 'CATEGORY',
        });
        console.log("category response:", categoryResponse.data);

        const categories = new Map(categoryResponse.response.objects?.map((category) => ([category.id, category.categoryData.name])))

        const inventoryResponse = await client.inventory.batchGetCounts({
            locationIds: [
                location,
            ]
        })

        console.log('inventory response:', inventoryResponse.data)

        const inventoryMap = new Map(inventoryResponse.response.counts?.map((count) => ([count.catalogObjectId, count.quantity])));

        const { response } = await client.catalog.list({
            types: 'ITEM',
        });
        const items = response.objects?.map((item) => (
            {
                itemId: item.id,
                name: item.itemData.name,
                variations: item.itemData.variations.map((variation) => (
                    {
                        name: variation.itemVariationData.name,
                        sku: variation.itemVariationData.sku,
                        variationId: variation.id,
                        stock: (inventoryMap.get(variation.id) || 0)
                    }
                )),
                categories: item.itemData.categories?.map((category) => (categories.get(category.id)))
            }
        ))
        return NextResponse.json({ items });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to get whole catalog' }, { status: 500 });
    }

}