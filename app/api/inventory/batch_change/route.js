import { NextResponse } from 'next/server';
import { SquareClient } from 'square';
import process from 'process';

/*
body:

{
    changes: [
        {
            catalogObjectId: _,
            quantity: _,
            locationId: _,
        }
    ]
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

        const idempotencyKey = crypto.randomUUID();
        const changes = body.changes;

        const response = await client.inventory.batchCreateChanges({
            idempotencyKey,
            changes: changes.map((change) => ({
                type: "PHYSICAL_COUNT",
                physicalCount: {
                    catalogObjectId: change.catalogObjectId,
                    quantity: change.quantity,
                    state: "IN_STOCK",
                    locationId: change.locationId,
                    occurredAt: new Date().toISOString(),
                }
            }))
            ,
        })

        return NextResponse.json(response);


    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to change inventory' }, { status: 500 });
    }
}
