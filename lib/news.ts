// Google News RSS取得ユーティリティ

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

// Google News RSSからニュースを取得
export async function fetchGoogleNews(keyword: string, limit: number = 5): Promise<NewsItem[]> {
    try {
        const encodedKeyword = encodeURIComponent(keyword);
        const rssUrl = `https://news.google.com/rss/search?q=${encodedKeyword}&hl=ja&gl=JP&ceid=JP:ja`;

        const response = await fetch(rssUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AIFundManager/1.0)',
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch news for "${keyword}": ${response.status}`);
            return [];
        }

        const xmlText = await response.text();
        const newsItems = parseRssXml(xmlText, limit);

        return newsItems;
    } catch (error) {
        console.error(`Error fetching news for "${keyword}":`, error);
        return [];
    }
}

// RSSのXMLをパース
function parseRssXml(xml: string, limit: number): NewsItem[] {
    const items: NewsItem[] = [];

    // <item>タグを抽出
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < limit) {
        const itemContent = match[1];

        // タイトルを抽出
        const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
        const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '') : '';

        // リンクを抽出
        const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
        const link = linkMatch ? linkMatch[1] : '';

        // 公開日を抽出
        const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
        const pubDate = pubDateMatch ? pubDateMatch[1] : '';

        // ソースを抽出 (Google Newsの場合、タイトルに含まれることが多い)
        const sourceMatch = itemContent.match(/<source[^>]*>(.*?)<\/source>/);
        const source = sourceMatch ? sourceMatch[1] : extractSourceFromTitle(title);

        if (title) {
            items.push({
                title: cleanTitle(title),
                link,
                pubDate,
                source,
            });
            count++;
        }
    }

    return items;
}

// タイトルからソース名を抽出（ " - ソース名" 形式）
function extractSourceFromTitle(title: string): string {
    const parts = title.split(' - ');
    if (parts.length > 1) {
        return parts[parts.length - 1];
    }
    return 'Google News';
}

// タイトルをクリーンアップ（HTMLエンティティをデコード）
function cleanTitle(title: string): string {
    return title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

// 保有銘柄に関連するニュースを取得
export async function fetchStockNews(stockNames: string[]): Promise<Map<string, NewsItem[]>> {
    const newsMap = new Map<string, NewsItem[]>();

    // 並列でニュースを取得（最大5銘柄同時）
    const chunks = [];
    for (let i = 0; i < stockNames.length; i += 5) {
        chunks.push(stockNames.slice(i, i + 5));
    }

    for (const chunk of chunks) {
        const results = await Promise.all(
            chunk.map(async (name) => {
                const news = await fetchGoogleNews(name, 3);
                return { name, news };
            })
        );

        for (const { name, news } of results) {
            newsMap.set(name, news);
        }
    }

    return newsMap;
}

// 一般的な投資ニュースを取得
export async function fetchMarketNews(): Promise<NewsItem[]> {
    const keywords = ['日経平均', '米国株 S&P500', '投資 市場'];
    const allNews: NewsItem[] = [];

    for (const keyword of keywords) {
        const news = await fetchGoogleNews(keyword, 3);
        allNews.push(...news);
    }

    // 重複を除去（タイトルで比較）
    const uniqueNews = allNews.filter((item, index, self) =>
        index === self.findIndex((t) => t.title === item.title)
    );

    return uniqueNews.slice(0, 10);
}
