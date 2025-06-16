
import { NextResponse } from 'next/server';
import { getMongoDBConnection } from '../utils';
import { getMerchantId, getSquareClient } from '../../square/utils';

export async function GET(request: Request) {
    try {
        const squareClient = await getSquareClient(request);
        const merchantId = await getMerchantId(squareClient);
        const mongoClient = await getMongoDBConnection();
        const doc = await mongoClient.db("square_integration_app").collection("Transactions").findOne({ merchant_id: merchantId });
        return NextResponse.json(doc);
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}