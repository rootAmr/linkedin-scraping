
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, location } = body;

        const token = process.env.RAPIDAPI_KEY;
        if (!token) {
            return NextResponse.json({ error: 'Server configuration error: Missing RapidAPI Key' }, { status: 500 });
        }

        const queryParams = new URLSearchParams({
            limit: '10',
            offset: '0',
            title_filter: title,
            location_filter: location || 'Indonesia',
            description_type: 'text'
        });

        const response = await fetch(`https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': token,
                'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`RapidAPI Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json({ jobs: data });

    } catch (error: any) {
        console.error('❌ Error fetching jobs:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
