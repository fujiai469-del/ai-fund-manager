import { NextRequest, NextResponse } from 'next/server';

interface InstitutionalHolder {
    holder: string;
    shares: number;
    dateReported: string;
    change: number;
    changePercentage: number;
    value: number;
}

// モックデータ（API未設定時用）
const MOCK_HOLDERS: Record<string, InstitutionalHolder[]> = {
    'AAPL': [
        { holder: 'Vanguard Group Inc', shares: 1279431000, dateReported: '2024-12-31', change: 12500000, changePercentage: 0.99, value: 236700000000 },
        { holder: 'BlackRock Inc', shares: 1012890000, dateReported: '2024-12-31', change: -5200000, changePercentage: -0.51, value: 187400000000 },
        { holder: 'Berkshire Hathaway Inc', shares: 915560382, dateReported: '2024-12-31', change: 0, changePercentage: 0, value: 169400000000 },
        { holder: 'State Street Corporation', shares: 591230000, dateReported: '2024-12-31', change: 8900000, changePercentage: 1.53, value: 109400000000 },
        { holder: 'FMR LLC (Fidelity)', shares: 350120000, dateReported: '2024-12-31', change: 15600000, changePercentage: 4.66, value: 64800000000 },
        { holder: 'Geode Capital Management', shares: 289000000, dateReported: '2024-12-31', change: 4500000, changePercentage: 1.58, value: 53500000000 },
        { holder: 'Morgan Stanley', shares: 245000000, dateReported: '2024-12-31', change: -12000000, changePercentage: -4.67, value: 45300000000 },
    ],
    'MSFT': [
        { holder: 'Vanguard Group Inc', shares: 890120000, dateReported: '2024-12-31', change: 8900000, changePercentage: 1.01, value: 373850000000 },
        { holder: 'BlackRock Inc', shares: 720450000, dateReported: '2024-12-31', change: -2100000, changePercentage: -0.29, value: 302590000000 },
        { holder: 'State Street Corporation', shares: 401230000, dateReported: '2024-12-31', change: 5600000, changePercentage: 1.41, value: 168520000000 },
        { holder: 'FMR LLC (Fidelity)', shares: 289560000, dateReported: '2024-12-31', change: 12300000, changePercentage: 4.44, value: 121615000000 },
        { holder: 'Capital Research Global', shares: 245780000, dateReported: '2024-12-31', change: -8900000, changePercentage: -3.49, value: 103228000000 },
        { holder: 'Geode Capital Management', shares: 198000000, dateReported: '2024-12-31', change: 3200000, changePercentage: 1.64, value: 83160000000 },
    ],
    'GOOGL': [
        { holder: 'Vanguard Group Inc', shares: 356780000, dateReported: '2024-12-31', change: 5600000, changePercentage: 1.59, value: 67500000000 },
        { holder: 'BlackRock Inc', shares: 298450000, dateReported: '2024-12-31', change: -3400000, changePercentage: -1.13, value: 56400000000 },
        { holder: 'State Street Corporation', shares: 178900000, dateReported: '2024-12-31', change: 2300000, changePercentage: 1.30, value: 33800000000 },
        { holder: 'FMR LLC (Fidelity)', shares: 156780000, dateReported: '2024-12-31', change: 8900000, changePercentage: 6.02, value: 29600000000 },
    ],
    'TSLA': [
        { holder: 'Vanguard Group Inc', shares: 198450000, dateReported: '2024-12-31', change: 12300000, changePercentage: 6.61, value: 49100000000 },
        { holder: 'BlackRock Inc', shares: 175890000, dateReported: '2024-12-31', change: 8900000, changePercentage: 5.33, value: 43500000000 },
        { holder: 'State Street Corporation', shares: 98760000, dateReported: '2024-12-31', change: 4500000, changePercentage: 4.78, value: 24400000000 },
        { holder: 'Geode Capital Management', shares: 45670000, dateReported: '2024-12-31', change: 2100000, changePercentage: 4.82, value: 11300000000 },
    ],
    'NVDA': [
        { holder: 'Vanguard Group Inc', shares: 890120000, dateReported: '2024-12-31', change: 45000000, changePercentage: 5.33, value: 123400000000 },
        { holder: 'BlackRock Inc', shares: 756780000, dateReported: '2024-12-31', change: 38000000, changePercentage: 5.29, value: 104900000000 },
        { holder: 'State Street Corporation', shares: 412300000, dateReported: '2024-12-31', change: 21000000, changePercentage: 5.37, value: 57100000000 },
        { holder: 'FMR LLC (Fidelity)', shares: 345670000, dateReported: '2024-12-31', change: 18900000, changePercentage: 5.78, value: 47900000000 },
        { holder: 'Geode Capital Management', shares: 198760000, dateReported: '2024-12-31', change: 12300000, changePercentage: 6.60, value: 27500000000 },
    ],
    '7203': [
        { holder: 'トヨタ自動車株式会社（自己株式）', shares: 500000000, dateReported: '2024-12-31', change: 0, changePercentage: 0, value: 1425000000000 },
        { holder: '日本マスタートラスト信託銀行', shares: 180000000, dateReported: '2024-12-31', change: 5000000, changePercentage: 2.86, value: 513000000000 },
        { holder: '日本カストディ銀行', shares: 120000000, dateReported: '2024-12-31', change: 2000000, changePercentage: 1.69, value: 342000000000 },
        { holder: 'ステートストリート', shares: 45000000, dateReported: '2024-12-31', change: 1500000, changePercentage: 3.45, value: 128250000000 },
        { holder: 'ブラックロック・ジャパン', shares: 38000000, dateReported: '2024-12-31', change: -500000, changePercentage: -1.30, value: 108300000000 },
    ],
    '6758': [
        { holder: '日本マスタートラスト信託銀行', shares: 150000000, dateReported: '2024-12-31', change: 3000000, changePercentage: 2.04, value: 2175000000000 },
        { holder: '日本カストディ銀行', shares: 95000000, dateReported: '2024-12-31', change: 1500000, changePercentage: 1.60, value: 1377500000000 },
        { holder: 'バンガード・グループ', shares: 42000000, dateReported: '2024-12-31', change: 800000, changePercentage: 1.94, value: 609000000000 },
        { holder: 'ブラックロック・ジャパン', shares: 35000000, dateReported: '2024-12-31', change: -200000, changePercentage: -0.57, value: 507500000000 },
    ],
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker')?.toUpperCase();

    if (!ticker) {
        return NextResponse.json(
            { success: false, error: 'ティッカーシンボルが必要です' },
            { status: 400 }
        );
    }

    const apiKey = process.env.FMP_API_KEY;

    // APIキー未設定時はモックデータを返却
    if (!apiKey) {
        console.log('FMP_API_KEY not configured, returning mock data');
        const mockData = MOCK_HOLDERS[ticker];

        if (mockData) {
            return NextResponse.json({
                success: true,
                data: mockData,
                isMock: true,
                message: 'モックデータを使用中。FMP_API_KEY環境変数を設定すると実データが利用できます。',
            });
        } else {
            // モックデータにない銘柄はランダム生成
            const randomHolders: InstitutionalHolder[] = [
                { holder: 'Vanguard Group Inc', shares: Math.floor(Math.random() * 500000000) + 100000000, dateReported: '2024-12-31', change: Math.floor(Math.random() * 10000000) - 5000000, changePercentage: (Math.random() * 10) - 5, value: Math.floor(Math.random() * 100000000000) },
                { holder: 'BlackRock Inc', shares: Math.floor(Math.random() * 400000000) + 80000000, dateReported: '2024-12-31', change: Math.floor(Math.random() * 8000000) - 4000000, changePercentage: (Math.random() * 8) - 4, value: Math.floor(Math.random() * 80000000000) },
                { holder: 'State Street Corporation', shares: Math.floor(Math.random() * 200000000) + 50000000, dateReported: '2024-12-31', change: Math.floor(Math.random() * 5000000) - 2500000, changePercentage: (Math.random() * 6) - 3, value: Math.floor(Math.random() * 50000000000) },
            ];

            return NextResponse.json({
                success: true,
                data: randomHolders,
                isMock: true,
                message: 'モックデータを使用中（ランダム生成）',
            });
        }
    }

    try {
        // Financial Modeling Prep API を呼び出す
        const response = await fetch(
            `https://financialmodelingprep.com/api/v3/institutional-holder/${ticker}?apikey=${apiKey}`,
            { next: { revalidate: 3600 } } // 1時間キャッシュ
        );

        if (!response.ok) {
            throw new Error(`FMP API error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                isMock: false,
            });
        }

        // データを整形
        const holders: InstitutionalHolder[] = data.slice(0, 10).map((item: {
            holder: string;
            shares: number;
            dateReported: string;
            change: number;
            changePercentage?: number;
        }) => ({
            holder: item.holder,
            shares: item.shares,
            dateReported: item.dateReported,
            change: item.change || 0,
            changePercentage: item.changePercentage || 0,
            value: item.shares * 185, // 概算（実際の株価を取得する場合は別APIが必要）
        }));

        return NextResponse.json({
            success: true,
            data: holders,
            isMock: false,
        });
    } catch (error) {
        console.error('FMP API Error:', error);

        // エラー時はモックデータにフォールバック
        const mockData = MOCK_HOLDERS[ticker];
        if (mockData) {
            return NextResponse.json({
                success: true,
                data: mockData,
                isMock: true,
                message: 'API接続エラーのためモックデータを使用',
            });
        }

        return NextResponse.json(
            { success: false, error: '機関投資家データの取得に失敗しました' },
            { status: 500 }
        );
    }
}
