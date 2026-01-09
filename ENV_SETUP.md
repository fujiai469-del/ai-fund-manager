# AI Fund Manager - 環境変数設定

このファイルは環境変数の設定例です。
実際の設定は `.env.local` ファイルを作成して行ってください。

## 必要な環境変数

### Firebase (オプション)
Firestore連携に必要です。未設定の場合はデモモードで動作します。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### NewsAPI (オプション)
ライブニュース取得に必要です。未設定の場合はモックデータを表示します。
取得先: https://newsapi.org/

```env
NEWSAPI_KEY=your_newsapi_key
```

### Google Gemini API (オプション)
AI分析機能に必要です。未設定の場合はモック分析を返します。
取得先: https://makersuite.google.com/app/apikey

```env
GEMINI_API_KEY=your_gemini_api_key
```

## セットアップ手順

1. このプロジェクトのルートディレクトリに `.env.local` ファイルを作成
2. 上記の環境変数を必要に応じて設定
3. `npm run dev` でアプリを起動

**注意**: すべての環境変数はオプションです。未設定でもデモモードでアプリは動作します。
