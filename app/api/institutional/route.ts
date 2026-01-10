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

        const prompt = `「${ticker}」銘柄を保有する主要機関投資家の上位5社を、以下のJSON配列形式のみで返してください。説明文は一切不要です。

[
  {"holder": "Vanguard Group Inc", "shares": 1279431000, "dateReported": "2024-12-31", "change": 12500000, "changePercentage": 0.99, "value": 236700000000},
  ...
]

- holder: 機関投資家名（英語）
- shares: 保有株数（整数）
- dateReported: 報告日（YYYY-MM-DD）
- change: 前期比増減株数（整数）
- changePercentage: 増減率（小数）
- value: 評価額USD（整数）

JSONのみ。他のテキストは不要。`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 4000,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API response error:', errorText);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('Gemini response:', text.substring(0, 200));

        // ```json ... ``` を除去
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // JSONを抽出（配列またはオブジェクト）
        let holders: InstitutionalHolder[];
        try {
            // まず直接パースを試みる
            holders = JSON.parse(text);
        } catch {
            // 失敗したら正規表現で抽出
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('JSON not found in response:', text);
                throw new Error('JSON not found in response');
            }
            holders = JSON.parse(jsonMatch[0]);
        }

        // 配列でない場合は配列に変換
        if (!Array.isArray(holders)) {
            holders = [holders];
        }

        return NextResponse.json({
            success: true,
            data: holders.slice(0, 7),
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
