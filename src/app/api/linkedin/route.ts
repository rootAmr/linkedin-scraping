
import { NextResponse } from 'next/server';
import { getLinkedInProfile } from '@/lib/linkdapi';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'Missing LinkedIn URL' },
                { status: 400 }
            );
        }

        const token = process.env.LINKDAPI_TOKEN;
        if (!token) {
            return NextResponse.json(
                { error: 'Server configuration error: Missing LinkdAPI Token' },
                { status: 500 }
            );
        }

        const profile = await getLinkedInProfile(url, token);

        return NextResponse.json({
            profile
        });

    } catch (error: any) {
        console.error('❌ Error scraping LinkedIn profile:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
