import { NextResponse } from 'next/server';
import type { NewsItem } from '@/types';

// 日本語モックニュースデータ（Vercelデプロイ用 - NewsAPI不使用）
const MOCK_NEWS: NewsItem[] = [
    {
        title: '日銀、金融政策決定会合で現状維持を決定 市場は円安進行に警戒',
        description: '日本銀行は金融政策決定会合で大規模金融緩和の維持を決定。市場では今後の為替動向に注目が集まっている。',
        url: 'https://example.com/news/1',
        source: { id: null, name: '日本経済新聞' },
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: '経済部',
    },
    {
        title: '半導体関連株が軒並み上昇 AI需要拡大への期待高まる',
        description: '東京株式市場で半導体関連銘柄が大幅高。生成AI向け需要の拡大期待から、買いが広がっている。',
        url: 'https://example.com/news/2',
        source: { id: null, name: '東洋経済オンライン' },
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: '編集部',
    },
    {
        title: '米国株式市場 S&P500が最高値更新 テック株がけん引',
        description: 'ニューヨーク株式市場でS&P500指数が史上最高値を更新。大手テクノロジー企業の好決算が相場を押し上げた。',
        url: 'https://example.com/news/3',
        source: { id: null, name: 'Bloomberg Japan' },
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: '金融チーム',
    },
    {
        title: '暗号資産市場が回復基調 ビットコインが節目突破',
        description: '暗号資産市場で買いが優勢。ビットコインは重要な抵抗線を突破し、投資家心理が改善している。',
        url: 'https://example.com/news/4',
        source: { id: null, name: 'コインテレグラフ' },
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: '暗号資産担当',
    },
    {
        title: '原油価格が上昇 中東情勢の緊迫化で供給懸念',
        description: '国際原油価格が上昇。中東地域での地政学リスク高まりを受け、供給不安から買いが入っている。',
        url: 'https://example.com/news/5',
        source: { id: null, name: 'ロイター' },
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: 'コモディティ担当',
    },
    {
        title: '製薬大手の新薬承認で株価急騰 がん治療に新たな選択肢',
        description: '大手製薬会社が開発した新たながん治療薬がFDA承認を取得。関連銘柄に買いが殺到している。',
        url: 'https://example.com/news/6',
        source: { id: null, name: '医薬経済' },
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: 'ヘルスケア担当',
    },
    {
        title: '不動産市場に底打ち感 都心オフィス空室率が改善',
        description: '東京都心のオフィス空室率が3ヶ月連続で低下。企業のオフィス回帰の動きが加速している。',
        url: 'https://example.com/news/7',
        source: { id: null, name: '不動産経済新聞' },
        publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: '不動産担当',
    },
    {
        title: '個人消費、物価高でも底堅く推移 インバウンド需要が下支え',
        description: '総務省が発表した家計調査によると、個人消費は物価上昇にもかかわらず堅調に推移。訪日観光客の増加が寄与している。',
        url: 'https://example.com/news/8',
        source: { id: null, name: '時事通信' },
        publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        author: '経済統計担当',
    },
];

export async function GET() {
    // Vercelデプロイ版では常にモックニュースを返す（NewsAPIは有料のため）
    return NextResponse.json({
        success: true,
        data: MOCK_NEWS,
        isMock: true,
        message: 'サンプルニュースを表示中',
    });
}
