import { NextResponse } from 'next/server';
import { SquareClient } from 'square';
import process from 'process';

/*
body:

{
    object: 
        {
            type: string,
            id: string (catalogObjectId),
            version: string,
            itemVariationData: {
                itemId: string,

            }
        }
    
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

        const response = await client.catalog.object.upsert({
            idempotencyKey,
            object: {
                type: object.type,
                id: object.id,
                version: BigInt(object.version),
                itemVariationData: {

                }
            }
            ,
        })

        return NextResponse.json(response);


    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to change inventory' }, { status: 500 });
    }
}
