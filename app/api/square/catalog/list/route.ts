import { NextResponse } from 'next/server';
import { Square, SquareClient } from 'square';
import { filterBigInt } from '../../../../utils';


export async function GET(request: Request) {
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

        const categories = new Map(categoryResponse.data?.map((category: Square.CatalogObjectCategory) => ([category.id, category.categoryData?.name])))
        const inventoryResponse = await client.inventory.batchGetCounts({
            locationIds: [
                location,
            ]
        })

        const inventoryMap = new Map(inventoryResponse.data?.map((count) => ([count.catalogObjectId, count.quantity])));

        const catalogItemsResponse = await client.catalog.list({
            types: 'ITEM',
        });
        const items = (catalogItemsResponse.data as Square.CatalogObjectItem[])?.map((item) => (
            {
                itemId: item.id,
                name: item.itemData?.name,
                variations: (item.itemData?.variations as Square.CatalogObjectItemVariation[])?.map((variation) => (
                    {
                        name: variation.itemVariationData?.name,
                        sku: variation.itemVariationData?.sku,
                        variationId: variation.id,
                        stock: (inventoryMap.get(variation.id) || 0),
                        price: variation.itemVariationData?.priceMoney?.amount,
                    }
                )),
                categories: item.itemData?.categories?.map((category) => (categories.get(category.id)))
            }
        ))
        return NextResponse.json(filterBigInt(items).JSONObject);

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to get whole catalog' }, { status: 500 });
    }

}