import { NextRequest, NextResponse } from 'next/server';
import type { Asset, NewsItem, AIAnalysis } from '@/types';
import { convertToJPY } from '@/types';
import { fetchGoogleNews, fetchMarketNews, type NewsItem as GoogleNewsItem } from '@/lib/news';

// モックAI分析（OpenAI APIキー未設定時用）
function generateMockAnalysis(assets: Asset[], news: NewsItem[]): AIAnalysis {
    // 全て円換算で計算
    const totalValue = assets.reduce((sum, a) => sum + convertToJPY(a.quantity * a.currentPrice, a.currency), 0);
    const totalCost = assets.reduce((sum, a) => sum + convertToJPY(a.quantity * a.averageCost, a.currency), 0);
    const gainPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    // パフォーマンスに基づいてセンチメント判定
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let sentimentScore = 0;

    if (gainPercent > 5) {
        sentiment = 'bullish';
        sentimentScore = Math.min(80, gainPercent * 2);
    } else if (gainPercent < -5) {
        sentiment = 'bearish';
        sentimentScore = Math.max(-80, gainPercent * 2);
    }

    // セクター分析
    const sectorValues: Record<string, number> = {};
    assets.forEach(asset => {
        sectorValues[asset.sector] = (sectorValues[asset.sector] || 0) + asset.quantity * asset.currentPrice;
    });

    const sectorAnalysis = Object.entries(sectorValues).map(([sector, value]) => ({
        sector,
        outlook: Math.random() > 0.5 ? 'positive' as const : Math.random() > 0.5 ? 'neutral' as const : 'negative' as const,
        weight: (value / totalValue) * 100,
        recommendedWeight: Math.random() * 20 + 5,
        commentary: `${sector}セクターは現在の市場環境において${Math.random() > 0.5 ? '堅調な推移' : '慎重な姿勢が必要'}です。`,
    }));

    // 最新ニュースのサマリー
    const newsHeadlines = news.slice(0, 3).map(n => `• ${n.title}`).join('\n');

    const fullAnalysis = `
# 📊 ポートフォリオ分析レポート

## エグゼクティブサマリー

現在のポートフォリオは**${assets.length}銘柄**で構成されており、総評価額は**¥${totalValue.toLocaleString()}**です。

${gainPercent >= 0
            ? `✅ 含み益は**+${gainPercent.toFixed(2)}%**で、良好なパフォーマンスを維持しています。`
            : `⚠️ 含み損は**${gainPercent.toFixed(2)}%**ですが、長期的な視点での保有を推奨します。`}

---

## 🎯 市場センチメント分析

現在の市場は**${sentiment === 'bullish' ? '🟢 強気（ブル）' : sentiment === 'bearish' ? '🔴 弱気（ベア）' : '🟡 中立'}**の傾向にあります。

### 注目すべき最新ニュース

${newsHeadlines}

これらのニュースから、以下の市場トレンドが読み取れます：
- テクノロジーセクターへの投資家関心は依然として高い水準を維持
- 金融政策の動向が今後の相場を左右する可能性
- 地政学リスクには引き続き注意が必要

---

## ⚠️ ポートフォリオ脆弱性診断

### 高リスク要因

1. **セクター集中リスク**
   - 特定セクターへの偏りが見られます
   - 推奨：異なるセクターへの分散投資を検討してください

2. **市場ボラティリティリスク**
   - 現在の市場環境は変動が激しい状態です
   - 推奨：ポジションサイズの見直しを検討してください

### 中リスク要因

3. **金利変動リスク**
   - 中央銀行の政策変更がポートフォリオに影響を与える可能性
   - 推奨：金利感応度の高い銘柄の比率を確認してください

---

## 💡 推奨アクションプラン

### 📅 短期（1-3ヶ月）

| アクション | 優先度 | 詳細 |
|-----------|--------|------|
| ポートフォリオ見直し | 高 | 含み益の大きい銘柄は一部利確を検討 |
| リバランス | 中 | セクター配分を目標比率に調整 |

### 📅 中期（3-12ヶ月）

- **成長セクターへの投資**: AI・半導体関連への段階的な投資を推奨
- **ディフェンシブ銘柄の追加**: 公益・生活必需品セクターでリスク分散

### 📅 長期（1年以上）

- **複利効果の活用**: 配当再投資による資産成長の加速
- **積立投資の継続**: ドルコスト平均法で市場タイミングリスクを軽減

---

## 📈 セクター別見通し

${sectorAnalysis.map(s =>
                `### ${s.sector}\n- 現在比率: **${s.weight.toFixed(1)}%**\n- 見通し: ${s.outlook === 'positive' ? '🟢 ポジティブ' : s.outlook === 'negative' ? '🔴 ネガティブ' : '🟡 中立'}\n- ${s.commentary}`
            ).join('\n\n')}

---

## 📋 総合評価

| 指標 | 評価 |
|------|------|
| 収益性 | ${gainPercent > 10 ? '⭐⭐⭐⭐⭐' : gainPercent > 5 ? '⭐⭐⭐⭐' : gainPercent > 0 ? '⭐⭐⭐' : '⭐⭐'} |
| 分散度 | ${Object.keys(sectorValues).length > 3 ? '⭐⭐⭐⭐' : '⭐⭐⭐'} |
| リスク管理 | ⭐⭐⭐ |

---

> **免責事項**: この分析は参考情報であり、投資助言ではありません。投資判断は自己責任で行ってください。過去のパフォーマンスは将来の結果を保証するものではありません。
  `.trim();

    return {
        sentiment,
        sentimentScore,
        marketOverview: `市場は${sentiment === 'bullish' ? '強気' : sentiment === 'bearish' ? '弱気' : '中立'}トレンドにあります。${assets.length}銘柄のポートフォリオは${gainPercent >= 0 ? 'プラス' : 'マイナス'}圏（${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%）で推移しています。`,
        vulnerabilities: [
            {
                severity: 'medium',
                title: 'セクター集中リスク',
                description: 'ポートフォリオが特定セクターに偏っている可能性があります。分散投資を検討してください。',
                affectedAssets: assets.slice(0, 2).map(a => a.name),
            },
            {
                severity: 'low',
                title: '市場ボラティリティ',
                description: '現在の市場環境は変動が予想されます。リスク管理を徹底してください。',
                affectedAssets: [],
            },
        ],
        recommendations: [
            {
                action: 'hold',
                priority: 'high',
                title: '現在のポジション維持',
                description: '大きなポジション変更は控え、市場動向を注視することを推奨します。',
                reasoning: '不確実性が高い市場環境では、急激な変更よりも段階的なアプローチが有効です。',
            },
            {
                action: 'watch',
                priority: 'medium',
                title: 'テクノロジーセクターに注目',
                description: 'AI関連銘柄の成長ポテンシャルに注目し、エントリーポイントを探ることを推奨します。',
                reasoning: 'テクノロジーセクターは長期的な成長が期待されています。',
            },
        ],
        sectorAnalysis,
        fullAnalysis,
        generatedAt: new Date(),
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assets, news } = body as { assets: Asset[]; news: NewsItem[] };

        if (!assets || !Array.isArray(assets)) {
            return NextResponse.json(
                { success: false, error: '無効なアセットデータです' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GOOGLE_API_KEY;

        // APIキー未設定時はモック分析を返却
        if (!apiKey) {
            console.log('Google API key not configured, returning mock analysis');
            return NextResponse.json({
                success: true,
                data: generateMockAnalysis(assets, news || []),
                isMock: true,
                message: 'モック分析を使用中。GOOGLE_API_KEY環境変数を設定するとAI分析が利用できます。',
            });
        }

        // Google Gemini APIを直接呼び出す
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        console.log('Using Gemini 2.5 Flash via REST API');

        // ポートフォリオサマリー作成（全て円換算）
        const portfolioSummary = assets.map(a => {
            const valueJPY = convertToJPY(a.quantity * a.currentPrice, a.currency);
            const costJPY = convertToJPY(a.quantity * a.averageCost, a.currency);
            const gainPercent = (valueJPY - costJPY) / costJPY * 100;
            return {
                銘柄名: a.name,
                ティッカー: a.ticker,
                セクター: a.sector,
                通貨: a.currency,
                保有数: a.quantity,
                平均取得単価: a.currency === 'USD' ? `$${a.averageCost}（≈¥${Math.round(a.averageCost * 155).toLocaleString()}）` : `¥${a.averageCost.toLocaleString()}`,
                現在値: a.currency === 'USD' ? `$${a.currentPrice}（≈¥${Math.round(a.currentPrice * 155).toLocaleString()}）` : `¥${a.currentPrice.toLocaleString()}`,
                評価額_円: valueJPY,
                投資額_円: costJPY,
                損益率: gainPercent.toFixed(2) + '%',
                損益率_数値: gainPercent,
            };
        });

        // 全て円換算で合計
        const totalValue = assets.reduce((sum, a) => sum + convertToJPY(a.quantity * a.currentPrice, a.currency), 0);
        const totalCost = assets.reduce((sum, a) => sum + convertToJPY(a.quantity * a.averageCost, a.currency), 0);

        // セクター別集計（円換算）
        const sectorData: Record<string, { value: number; cost: number; count: number }> = {};
        assets.forEach(a => {
            if (!sectorData[a.sector]) {
                sectorData[a.sector] = { value: 0, cost: 0, count: 0 };
            }
            sectorData[a.sector].value += convertToJPY(a.quantity * a.currentPrice, a.currency);
            sectorData[a.sector].cost += convertToJPY(a.quantity * a.averageCost, a.currency);
            sectorData[a.sector].count++;
        });

        const sectorSummary = Object.entries(sectorData).map(([sector, data]) => ({
            セクター: sector,
            評価額: data.value,
            投資額: data.cost,
            損益率: ((data.value - data.cost) / data.cost * 100).toFixed(2) + '%',
            銘柄数: data.count,
            ポートフォリオ比率: ((data.value / totalValue) * 100).toFixed(1) + '%',
        }));

        // 最大損失銘柄と最大利益銘柄
        const sortedByPerformance = [...portfolioSummary].sort((a, b) => b.損益率_数値 - a.損益率_数値);
        const topPerformer = sortedByPerformance[0];
        const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

        // 📰 Google News RSSから最新ニュースを取得
        console.log('保有株関連ニュースを取得中...');

        // 各保有銘柄のニュースを取得
        const stockNewsPromises = assets.map(async (asset) => {
            const news = await fetchGoogleNews(asset.name, 2);
            return { name: asset.name, ticker: asset.ticker, news };
        });
        const stockNewsResults = await Promise.all(stockNewsPromises);

        // 市場全体のニュースを取得
        const marketNews = await fetchMarketNews();

        // ニュースサマリー作成
        let newsSection = '## 📰 最新ニュース（リアルタイム取得）\n\n';

        // 各銘柄のニュース
        newsSection += '### 保有銘柄関連ニュース\n';
        for (const { name, ticker, news } of stockNewsResults) {
            if (news.length > 0) {
                newsSection += `\n**${name} (${ticker})**\n`;
                for (const item of news) {
                    newsSection += `- ${item.title} (出典: ${item.source})\n`;
                }
            }
        }

        // 市場全体のニュース
        newsSection += '\n### 市場全体のニュース\n';
        for (const item of marketNews.slice(0, 5)) {
            newsSection += `- ${item.title} (出典: ${item.source})\n`;
        }

        console.log(`取得完了: 銘柄関連${stockNewsResults.reduce((sum, r) => sum + r.news.length, 0)}件, 市場全体${marketNews.length}件`);

        const prompt = `
あなたは個人投資家の資産形成をサポートするプロのファンドマネージャーです。
以下のポートフォリオを分析し、**個人投資家にとって実践的で分かりやすいアドバイス**を提供してください。

専門用語は避けるか、使う場合は簡単な説明を添えてください。
「なぜそうすべきか」の理由を分かりやすく伝えることを心がけてください。

---

## 📊 ポートフォリオ概要

| 指標 | 値 |
|------|-----|
| 総評価額 | ¥${totalValue.toLocaleString()} |
| 総投資額 | ¥${totalCost.toLocaleString()} |
| 含み損益 | ¥${(totalValue - totalCost).toLocaleString()} (${((totalValue - totalCost) / totalCost * 100).toFixed(2)}%) |
| 保有銘柄数 | ${assets.length}銘柄 |

### ベストパフォーマー
**${topPerformer?.銘柄名}** (${topPerformer?.ティッカー}): +${topPerformer?.損益率_数値.toFixed(2)}%

### ワーストパフォーマー
**${worstPerformer?.銘柄名}** (${worstPerformer?.ティッカー}): ${worstPerformer?.損益率_数値.toFixed(2)}%

---

## 保有銘柄詳細
${JSON.stringify(portfolioSummary, null, 2)}

## セクター配分
${JSON.stringify(sectorSummary, null, 2)}

${newsSection}

---

## 分析項目（個人投資家向け）

### 1. ポートフォリオの健康診断 📋
- **総合スコア**: ○○点/100点
- バランスの良さ、リスク、成長性の観点から評価

### 2. 良い点・気になる点
- **👍 良い点**: このポートフォリオの強み
- **⚠️ 気になる点**: 改善できそうなポイント

### 3. 各銘柄のひとことコメント
各銘柄について：
- 今後の見通し（強気/やや強気/中立/やや弱気/弱気）
- 今やるべきこと（このまま保有/買い増し検討/一部売却検討）

### 4. セクターバランスの改善提案
- 現在の配分で偏りすぎているところはあるか
- もしリバランスするならどうすべきか（具体的な金額目安付き）

### 5. 今後3ヶ月のアクションプラン
- 優先度が高いものから順に、具体的に何をすべきか
- 「いつ」「何を」「どれくらい」を明記

### 6. 長期的な資産形成アドバイス
- このポートフォリオの将来性
- 積立投資や配当再投資の観点からのアドバイス

---

**重要**: 難しい専門用語や計算式は使わず、投資初心者でも理解できる言葉で説明してください。
Markdown形式で、見出しと表を効果的に使用して構造化すること。
`;

        const systemPrompt = `あなたは個人投資家の味方となるプロのファンドマネージャーです。

【あなたのスタンス】
- 15年以上の資産運用経験を持つ
- 日本株・米国株両方に精通
- 難しい話をわかりやすく説明するのが得意
- 個人投資家の立場に寄り添ったアドバイスを心がける

【コミュニケーションスタイル】
✅ 専門用語は避けるか、使う場合は「○○（〜という意味）」と説明を添える
✅ 「なぜ」そうすべきかの理由を必ず説明する
✅ 具体的な金額や株数で提案する（例：「5万円分追加購入」「10株売却」）
✅ 長期的な資産形成の視点を大切にする
✅ 過度に不安を煽らない、前向きなトーンで

【絶対禁止事項】
❌ VaR、シャープレシオ、HHI指数などの専門指標をそのまま使う
❌ 「機関投資家」「プロ向け」などのワード
❌ 過度に悲観的・煽り的な表現
❌ 曖昧すぎて行動に移せないアドバイス

【出力フォーマット】
Markdown形式で見やすく構造化すること。絵文字を効果的に使用して親しみやすさを演出。`;


        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt + '\n\n' + prompt }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 8000,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // 分析結果からセンチメント判定
        let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        let sentimentScore = 0;

        if (analysisText.includes('強気') || analysisText.includes('上昇') || analysisText.includes('ポジティブ')) {
            sentiment = 'bullish';
            sentimentScore = 60;
        } else if (analysisText.includes('弱気') || analysisText.includes('下落') || analysisText.includes('ネガティブ')) {
            sentiment = 'bearish';
            sentimentScore = -60;
        }

        const analysis: AIAnalysis = {
            sentiment,
            sentimentScore,
            marketOverview: 'AI分析による市場概況',
            vulnerabilities: [],
            recommendations: [],
            sectorAnalysis: [],
            fullAnalysis: analysisText,
            generatedAt: new Date(),
        };

        return NextResponse.json({
            success: true,
            data: analysis,
            isMock: false,
        });
    } catch (error) {
        console.error('Error in analyze API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        return NextResponse.json(
            { success: false, error: `分析に失敗しました: ${errorMessage}` },
            { status: 500 }
        );
    }
}
