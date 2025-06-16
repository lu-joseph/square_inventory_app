import { NextResponse } from 'next/server';
import { Square, SquareClient } from 'square';
import process from 'process';
import { filterBigInt } from '../../../../utils';


type Change = {
    objectId: string,
    newPrice: string, //(dollars * 100)
}

/*
body:
{
    changes: Change[]
}
*/

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const urlParams = new URLSearchParams(new URL(request.url).search);
        const token = urlParams.get('token');
        if (!token) {
            return NextResponse.json({ error: "token missing from query params" }, { status: 500 })
        }
        const client = new SquareClient({
            environment: process.env.NEXT_PUBLIC_SQUARE_BASE_URL,
            token: token,
        });

        const response = await client.catalog.batchGet({
            objectIds: body.changes.map((change: Change) => change.objectId)
        })
        const newPriceLookup = new Map<string, bigint>(body.changes.map((change: Change) => [change.objectId, BigInt(change.newPrice)]))

        const objects = response.objects;

        const alteredObjects = objects?.
            filter((item): item is Square.CatalogObject & { type: 'ITEM' } => item.type == 'ITEM' && item.itemData !== null).
            map((object: Square.CatalogObjectItem) => ({
                ...object,
                itemData: {
                    ...object.itemData,
                    variations: (object.itemData?.variations as Square.CatalogObjectItemVariation[])?.map((variation) => ({
                        ...variation,
                        itemVariationData: {
                            ...variation.itemVariationData,
                            pricingType: Square.CatalogPricingType.FixedPricing,
                            priceMoney: {
                                amount: newPriceLookup.get(object.id),
                                currency: Square.Currency.Usd
                            }
                        },
                        type: Square.CatalogObjectType.ItemVariation
                    }))
                },
                type: Square.CatalogObjectType.Item
            }));

        const idempotencyKey = crypto.randomUUID();

        const batchUpsertResponse = await client.catalog.batchUpsert({
            idempotencyKey: idempotencyKey,
            batches: [
                { objects: alteredObjects ?? [] }
            ]
        })
        return NextResponse.json(filterBigInt(batchUpsertResponse));

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to get inventory' }, { status: 500 });
    }
}
