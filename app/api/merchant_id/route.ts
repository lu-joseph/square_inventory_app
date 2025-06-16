import { NextResponse } from 'next/server';
import { SquareClient } from 'square';

export async function GET(request: Request) {
    const urlParams = new URLSearchParams(new URL(request.url).search);
    const token = urlParams.get('token');
    if (!token)
        return NextResponse.json({ error: "token missing from query params" }, { status: 500 })
    const client = new SquareClient({
        environment: process.env.NEXT_PUBLIC_SQUARE_BASE_URL,
        token: token,
    });
    const result = await client.oAuth.retrieveTokenStatus();
    if (result.errors?.length)
        return NextResponse.json(result.errors);
    return NextResponse.json({ merchantId: result.merchantId });
}