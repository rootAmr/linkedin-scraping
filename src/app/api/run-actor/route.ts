
import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, actorId, input } = body;

        if (!token || !actorId) {
            return NextResponse.json(
                { error: 'Missing token or actorId' },
                { status: 400 }
            );
        }

        const client = new ApifyClient({
            token: token,
        });

        console.log('🚀 Starting actor:', actorId);

        // Run the actor
        const run = await client.actor(actorId).call(input || {});

        console.log('✅ Actor run completed! Run info:', run);

        // Fetch results from the default dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        return NextResponse.json({
            run,
            items
        });

    } catch (error: any) {
        console.error('❌ Error running actor:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
