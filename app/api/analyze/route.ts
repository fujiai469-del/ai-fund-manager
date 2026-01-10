import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Asset, NewsItem, AIAnalysis } from '@/types';

// モックAI分析（OpenAI APIキー未設定時用）
function generateMockAnalysis(assets: Asset[], news: NewsItem[]): AIAnalysis {
    const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
    const totalCost = assets.reduce((sum, a) => sum + a.quantity * a.averageCost, 0);
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

        // Google Gemini初期化
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        console.log('Gemini API initialized successfully');

        // ポートフォリオサマリー作成
        const portfolioSummary = assets.map(a => ({
            銘柄名: a.name,
            ティッカー: a.ticker,
            セクター: a.sector,
            保有数: a.quantity,
            平均取得単価: a.averageCost,
            現在値: a.currentPrice,
            評価額: a.quantity * a.currentPrice,
            損益率: ((a.currentPrice - a.averageCost) / a.averageCost) * 100,
        }));

        const totalValue = portfolioSummary.reduce((sum, a) => sum + a.評価額, 0);
        const totalCost = assets.reduce((sum, a) => sum + a.quantity * a.averageCost, 0);

        // セクター別集計
        const sectorData: Record<string, { value: number; cost: number; count: number }> = {};
        assets.forEach(a => {
            if (!sectorData[a.sector]) {
                sectorData[a.sector] = { value: 0, cost: 0, count: 0 };
            }
            sectorData[a.sector].value += a.quantity * a.currentPrice;
            sectorData[a.sector].cost += a.quantity * a.averageCost;
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
        const sortedByPerformance = [...portfolioSummary].sort((a, b) => b.損益率 - a.損益率);
        const topPerformer = sortedByPerformance[0];
        const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

        // ニュースサマリー作成
        const newsSummary = (news || []).slice(0, 8).map(n => ({
            見出し: n.title,
            出典: n.source?.name || '不明',
            公開日時: n.publishedAt,
        }));

        const prompt = `
あなたはゴールドマン・サックス、モルガン・スタンレー級の超一流ファンドマネージャーです。
以下のポートフォリオを徹底的に分析し、**機関投資家レベルの専門的なレポート**を作成してください。

一般的な「分散投資を心がけましょう」のような素人向けアドバイスは不要です。
**具体的な数値**と**実行可能な戦略**を提示してください。

---

## 📊 ポートフォリオ概要

| 指標 | 値 |
|------|-----|
| 総評価額 | ¥${totalValue.toLocaleString()} |
| 総投資額 | ¥${totalCost.toLocaleString()} |
| 含み損益 | ¥${(totalValue - totalCost).toLocaleString()} (${((totalValue - totalCost) / totalCost * 100).toFixed(2)}%) |
| 保有銘柄数 | ${assets.length}銘柄 |

### ベストパフォーマー
**${topPerformer?.銘柄名}** (${topPerformer?.ティッカー}): +${topPerformer?.損益率.toFixed(2)}%

### ワーストパフォーマー
**${worstPerformer?.銘柄名}** (${worstPerformer?.ティッカー}): ${worstPerformer?.損益率.toFixed(2)}%

---

## 保有銘柄詳細
${JSON.stringify(portfolioSummary, null, 2)}

## セクター配分
${JSON.stringify(sectorSummary, null, 2)}

## 最新市場ニュース
${JSON.stringify(newsSummary, null, 2)}

---

## 必須分析項目（すべて具体的な数値で回答すること）

### 1. ポートフォリオ診断スコア (100点満点)
- **分散度スコア**: ○○点/25点 - セクター集中度、銘柄数評価
- **リスク調整後リターン**: ○○点/25点 - 想定シャープレシオ
- **バリュエーション**: ○○点/25点 - 割高/割安判定
- **モメンタム**: ○○点/25点 - 直近トレンド評価

### 2. リスク分析
- **最大想定損失 (VaR 95%)**: 具体的な金額を算出
- **セクター集中リスク**: HHI指数に基づく評価
- **相関リスク**: 保有銘柄間の相関係数推定

### 3. 個別銘柄レーティング
各銘柄について:
- **投資判断**: Strong Buy / Buy / Hold / Sell / Strong Sell
- **目標株価**: 具体的な価格を設定（現在値からの上昇/下落余地%）
- **優先アクション**: 買い増し/保有継続/一部利確/全売却

### 4. 戦術的アセットアロケーション
- 現在の配分と推奨配分の**具体的な比較表**
- リバランスすべき**具体的な金額**

### 5. 短期トレード機会（1-4週間）
- ニュースに基づく**具体的なトレードアイデア**
- エントリー/エグジットポイント

### 6. リスクシナリオ分析
| シナリオ | 確率 | ポートフォリオ影響 |
|----------|------|-------------------|
| 強気シナリオ | ○○% | +○○% (¥○○) |
| 基本シナリオ | ○○% | +○○% (¥○○) |
| 弱気シナリオ | ○○% | -○○% (¥○○) |

---

**注意**: 抽象的な回答は厳禁。すべて**具体的な数値**で回答すること。
Markdown形式で、見出しと表を効果的に使用して構造化すること。
`;

        const systemPrompt = `あなたはゴールドマン・サックスのシニアポートフォリオマネージャー（運用資産1000億円以上）で、CFA・FRM資格保有者です。

【あなたの専門性】
- 20年以上の機関投資家経験
- 日本株・米国株両市場に精通
- クオンツ分析とファンダメンタル分析の両方を駆使

【絶対禁止事項】
❌ 「分散投資が大切」「長期投資を心がけて」等の初心者向けアドバイス
❌ 「注意が必要」「慎重に」等の曖昧な表現
❌ 具体的な数値のない推奨
❌ 「可能性がある」等の逃げの表現

【必須出力ルール】
✅ すべての分析に具体的な数値を付ける（例：VaR 95% = ¥234,000）
✅ 各銘柄に具体的な目標株価を設定（例：トヨタ ¥3,200 → 上昇余地+12.3%）
✅ 投資判断は必ず5段階で明示（Strong Buy/Buy/Hold/Sell/Strong Sell）
✅ リバランス指示は具体的な金額で（例：ソニー ¥50万円分売却 → 三菱UFJに振替）
✅ シナリオ分析は確率と金額を必ず記載

【計算式を使用すること】
- HHI（ハーフィンダール指数）= Σ(各セクター構成比%)² → 2500超で集中リスク高
- VaR 95% = ポートフォリオ価値 × 想定変動率 × 1.65
- シャープレシオ = (期待リターン - 無リスク金利) / 標準偏差

【出力フォーマット】
必ずMarkdownの表形式で見やすく構造化すること。絵文字を効果的に使用。`;

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: systemPrompt + '\n\n' + prompt }]
            }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8000,
            },
        });

        const analysisText = result.response.text();

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
