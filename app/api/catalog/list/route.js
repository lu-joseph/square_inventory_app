import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';



const client = new SquareClient({
    environment: SquareEnvironment.Production,
    token: process.env.SQUARE_API_KEY,
});

export async function GET() {
    try {
        const categoryResponse = await client.catalog.list({
            types: 'CATEGORY',
        });

        const categories = new Map(categoryResponse.response.objects.map((category) => ([category.id, category.categoryData.name])))

        const inventoryResponse = await client.inventory.batchGetCounts({
            locationIds: [
                process.env.LOCATION_ID,
            ]
        })

        const inventoryMap = new Map(inventoryResponse.response.counts.map((count) => ([count.catalogObjectId, count.quantity])));

        const { response } = await client.catalog.list({
            types: 'ITEM',
        });
        const items = response.objects.map((item) => (
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
                categories: item.itemData.categories.map((category) => (categories.get(category.id)))
            }
        ))
        return NextResponse.json(items);

    } catch (err) {
        console.error(err);
        return NextResponse.status(500).json({ error: 'Failed to get whole catalog' });
    }

}