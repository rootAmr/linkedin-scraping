
import axios from 'axios';

// Add 'axios' to dependencies if not present, or use fetch. 
// Plan said "linkdapi.js" content, I will implement a robust typescript version.

export interface LinkedInProfile {
    // Define minimal interface based on expected output or return any
    // LinkdAPI usually returns a big object.
    [key: string]: any;
}

export async function getLinkedInProfile(url: string, token: string): Promise<LinkedInProfile> {
    // Extract username from URL
    // Format: https://www.linkedin.com/in/username/
    const match = url.match(/\/in\/([^/]+)/);
    if (!match || !match[1]) {
        throw new Error('Invalid LinkedIn URL. Must contain /in/username');
    }
    const username = match[1];

    try {
        const response = await fetch(`https://linkdapi.com/api/v1/profile/overview?username=${username}`, {
            method: 'GET',
            headers: {
                'x-linkdapi-apikey': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`LinkdAPI Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch LinkedIn profile');
    }
}
