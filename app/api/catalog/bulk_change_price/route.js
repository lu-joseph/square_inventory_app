import { NextResponse } from 'next/server';
import { SquareClient } from 'square';
import process from 'process';
import { filterBigInt } from '../../../utils';

/*

type Change: {
    objectId: string,
    newPrice: string, (dollars * 100)
}

body:
{
    changes: Change[]
}
*/

export async function POST(request) {
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
            objectIds: body.changes.map((change) => change.objectId)
        })
        const newPriceLookup = new Map(body.changes.map((change) => [change.objectId, BigInt(change.newPrice)]))

        const objects = response.objects;

        const alteredObjects = objects?.map((object) => ({
            ...object,
            itemData: {
                ...object.itemData,
                variations: object.itemData.variations.map((variation) => ({
                    ...variation,
                    itemVariationData: {
                        ...variation.itemVariationData,
                        pricingType: "FIXED_PRICING",
                        priceMoney: {
                            amount: newPriceLookup.get(object.id),
                            currency: "USD"
                        }
                    }
                }))
            },
        }))

        const idempotencyKey = crypto.randomUUID();

        const batchUpsertResponse = await client.catalog.batchUpsert({
            idempotencyKey: idempotencyKey,
            batches: [
                { objects: alteredObjects }
            ]
        })


        return NextResponse.json(filterBigInt(batchUpsertResponse));


    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to get inventory' }, { status: 500 });
    }
}
