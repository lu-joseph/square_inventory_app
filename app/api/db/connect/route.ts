
import { NextResponse } from 'next/server';
import { getMongoDBConnection } from '../utils';

export async function GET(request: Request) {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = await getMongoDBConnection();

    return NextResponse.json({
        status: "ok",
    });
}