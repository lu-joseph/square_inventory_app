import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const code = data.code;
        const verifier = data.verifier
        console.log("incoming request body:", data);
        console.log("code:", data.code, "verifier:", data.verifier)
        const body = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.NEXT_PUBLIC_APP_ID,
                grant_type: 'authorization_code',
                code,
                code_verifier: verifier,
                redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI, // should match
            }),
        }
        console.log("outgoing request body:", body)
        const result = await fetch(`${process.env.NEXT_PUBLIC_SQUARE_BASE_URL}/oauth2/token`, body)
        const response = await result.json();
        console.log("returning response", response);

        return NextResponse.json(response);
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'Failed to get whole catalog' }, { status: 500 });
    }
}