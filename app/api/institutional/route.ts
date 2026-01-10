import { NextRequest, NextResponse } from 'next/server';

interface InstitutionalHolder {
    holder: string;
    shares: number;
    dateReported: string;
    change: number;
    changePercentage: number;
    value: number;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker')?.toUpperCase();

    if (!ticker) {
        return NextResponse.json(
            { success: false, error: 'ティッカーシンボルが必要です' },
            { status: 400 }
        );
    }

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { success: false, error: 'GOOGLE_API_KEYが設定されていません' },
            { status: 500 }
        );
    }

    try {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const prompt = `
あなたは機関投資家の保有状況に詳しい金融アナリストです。

「${ticker}」という銘柄（株式）を保有している主要な機関投資家について、
最新の13F報告書（四半期報告）に基づいた情報を提供してください。

以下のJSON形式で、上位5〜7社の機関投資家を返してください。
- holder: 機関投資家名（英語）
- shares: 保有株数（数値、例: 1279431000）
- dateReported: 報告日（YYYY-MM-DD形式、直近の四半期末）
- change: 前期比増減株数（数値、増加は正、減少は負）
- changePercentage: 前期比増減率（数値、%）
- value: 推定評価額（USD、数値）

必ず有効なJSONのみを返してください。説明文は不要です。
形式: [{"holder": "...", "shares": ..., ...}, ...]
`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2000,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // JSONを抽出
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('JSON not found in response');
        }

        const holders: InstitutionalHolder[] = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
            success: true,
            data: holders,
            source: 'gemini',
        });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { success: false, error: '機関投資家データの取得に失敗しました' },
            { status: 500 }
        );
    }
}
