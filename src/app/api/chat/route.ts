
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages, model } = body;

        if (!messages) {
            return NextResponse.json(
                { error: 'Missing messages' },
                { status: 400 }
            );
        }

        const token = process.env.HUGGINGFACE_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'Server configuration error: Missing Hugging Face Token' }, { status: 500 });
        }

        const modelId = model || process.env.AI_MODEL_ID || 'deepseek-ai/DeepSeek-V3.2:novita';

        const client = new OpenAI({
            baseURL: "https://router.huggingface.co/v1",
            apiKey: token,
        });

        // Completions
        const completion = await client.chat.completions.create({
            model: modelId,
            messages: messages,
            temperature: 0,
            max_tokens: 4000,
        });

        const content = completion.choices[0].message.content;

        return NextResponse.json({
            content
        });

    } catch (error: any) {
        console.error('❌ Error running chat:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
