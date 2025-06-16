import { NextResponse } from "next/server";
import { SquareClient } from "square";

export async function getSquareClient(request: Request) {
    const urlParams = new URLSearchParams(new URL(request.url).search);
    const token = urlParams.get('token');
    if (!token)
        throw new Error("token missing from query params")
    return new SquareClient({
        environment: process.env.NEXT_PUBLIC_SQUARE_BASE_URL,
        token: token,
    });
}

export async function getMerchantId(client: SquareClient) {
    const result = await client.oAuth.retrieveTokenStatus();
    if (result.errors?.length)
        throw new Error(result.errors.join())
    return result.merchantId
}