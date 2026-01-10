'use client';

import { useState, useEffect } from 'react';
import { Plus, Wallet, RefreshCw, BookOpen, Settings2, AlertTriangle } from 'lucide-react';
import PortfolioTable from '@/components/PortfolioTable';
import PortfolioChart from '@/components/PortfolioChart';
import AIAdvisorDisplay from '@/components/AIAdvisorDisplay';
import AddAssetModal from '@/components/AddAssetModal';
import GlossaryModal from '@/components/GlossaryModal';
import BottomNav, { type TabType } from '@/components/BottomNav';
import InstitutionalHoldings from '@/components/InstitutionalHoldings';
import SimulationPanel from '@/components/SimulationPanel';
import type { Asset, AssetFormData } from '@/types';
import { convertToJPY } from '@/types';
import { db, isFirebaseConfigured, COLLECTIONS } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

// Firebase未設定時のデモ用銘柄データ
const DEMO_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'トヨタ自動車',
    ticker: '7203',
    sector: 'Consumer Discretionary',
    currency: 'JPY',
    quantity: 100,
    averageCost: 2500,
    currentPrice: 2850,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'ソニーグループ',
    ticker: '6758',
    sector: 'Technology',
    currency: 'JPY',
    quantity: 50,
    averageCost: 12000,
    currentPrice: 14500,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: '任天堂',
    ticker: '7974',
    sector: 'Technology',
    currency: 'JPY',
    quantity: 20,
    averageCost: 6500,
    currentPrice: 8200,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: '三菱UFJフィナンシャル',
    ticker: '8306',
    sector: 'Finance',
    currency: 'JPY',
    quantity: 300,
    averageCost: 1200,
    currentPrice: 1580,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Apple',
    ticker: 'AAPL',
    sector: 'Technology',
    currency: 'USD',
    quantity: 10,
    averageCost: 150,
    currentPrice: 185,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Microsoft',
    ticker: 'MSFT',
    sector: 'Technology',
    currency: 'USD',
    quantity: 5,
    averageCost: 380,
    currentPrice: 420,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');

  // シミュレーション機能の状態
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [simExchangeRate, setSimExchangeRate] = useState(155);
  const [simMarketChange, setSimMarketChange] = useState(0);
  const isSimulating = simExchangeRate !== 155 || simMarketChange !== 0;

  const STORAGE_KEY = 'ai-fund-manager-assets';

  // localStorageからアセットを読み込む
  const loadFromLocalStorage = (): Asset[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Date型を復元
        return parsed.map((a: Asset) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
        }));
      }
    } catch (e) {
      console.log('localStorage読み込みエラー:', e);
    }
    return null;
  };

  // localStorageにアセットを保存する
  const saveToLocalStorage = (assetsToSave: Asset[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assetsToSave));
      console.log('ポートフォリオを保存しました');
    } catch (e) {
      console.log('localStorage保存エラー:', e);
    }
  };

  // マウント時にアセット読み込み
  useEffect(() => {
    loadAssets();
  }, []);

  // アセット変更時に自動保存
  useEffect(() => {
    if (assets.length > 0 && !isLoading) {
      saveToLocalStorage(assets);
    }
  }, [assets, isLoading]);

  const loadAssets = async () => {
    setIsLoading(true);

    // まずlocalStorageから読み込む
    const localAssets = loadFromLocalStorage();
    if (localAssets && localAssets.length > 0) {
      console.log('localStorageからポートフォリオを読み込みました');
      setAssets(localAssets);
      setIsUsingDemo(false);
      setIsLoading(false);
      return;
    }

    // Firebase設定確認
    if (!isFirebaseConfigured() || !db) {
      console.log('Firebase未設定のため、デモデータを使用します');
      setAssets(DEMO_ASSETS);
      setIsUsingDemo(true);
      setIsLoading(false);
      return;
    }

    try {
      // Firestoreへの接続をタイムアウト付きで試行（5秒）
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log('Firestore接続タイムアウト - デモデータを使用');
          resolve(null);
        }, 5000);
      });

      const queryPromise = getDocs(collection(db, COLLECTIONS.ASSETS));
      const result = await Promise.race([queryPromise, timeoutPromise]);

      // タイムアウトした場合
      if (result === null) {
        setAssets(DEMO_ASSETS);
        setIsUsingDemo(true);
        setIsLoading(false);
        return;
      }

      const loadedAssets: Asset[] = [];
      result.forEach((doc) => {
        const data = doc.data();
        loadedAssets.push({
          id: doc.id,
          name: data.name,
          ticker: data.ticker,
          sector: data.sector,
          currency: data.currency || 'JPY',
          quantity: data.quantity,
          averageCost: data.averageCost,
          currentPrice: data.currentPrice,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      // Firestoreが空の場合はデモデータを使用
      if (loadedAssets.length === 0) {
        console.log('Firestoreが空のため、デモデータを使用します');
        setAssets(DEMO_ASSETS);
        setIsUsingDemo(true);
        setIsLoading(false);
        return;
      }

      setAssets(loadedAssets);
      setIsUsingDemo(false);
    } catch (error) {
      console.log('Firestore接続エラー - デモデータを使用:', error);
      setAssets(DEMO_ASSETS);
      setIsUsingDemo(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsset = async (data: AssetFormData) => {
    // デモモード時はローカルステートのみ更新
    if (isUsingDemo || !db) {
      if (editingAsset) {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === editingAsset.id
              ? { ...a, ...data, updatedAt: new Date() }
              : a
          )
        );
      } else {
        const newAsset: Asset = {
          id: `demo-${Date.now()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setAssets((prev) => [...prev, newAsset]);
      }
      setEditingAsset(null);
      return;
    }

    try {
      if (editingAsset) {
        // 既存アセット更新
        const assetRef = doc(db, COLLECTIONS.ASSETS, editingAsset.id);
        await updateDoc(assetRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
        setAssets((prev) =>
          prev.map((a) =>
            a.id === editingAsset.id
              ? { ...a, ...data, updatedAt: new Date() }
              : a
          )
        );
      } else {
        // 新規アセット追加
        const docRef = await addDoc(collection(db, COLLECTIONS.ASSETS), {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        const newAsset: Asset = {
          id: docRef.id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setAssets((prev) => [...prev, newAsset]);
      }
      setEditingAsset(null);
    } catch (error) {
      console.error('アセット保存エラー:', error);
      throw error;
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    // デモモード時はローカルステートのみ更新
    if (isUsingDemo || !db) {
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      return;
    }

    try {
      await deleteDoc(doc(db, COLLECTIONS.ASSETS, assetId));
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
    } catch (error) {
      console.error('アセット削除エラー:', error);
    }
  };

  const handleUpdateNote = (assetId: string, note: { title: string; content: string; updatedAt: Date }) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, note: note.content ? note : undefined, updatedAt: new Date() }
          : a
      )
    );
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  // シミュレーション適用後の価格を計算
  const getSimulatedPrice = (asset: Asset) => {
    const marketMultiplier = 1 + simMarketChange / 100;
    const simulatedPrice = asset.currentPrice * marketMultiplier;
    return simulatedPrice;
  };

  // シミュレーション適用後の円換算を計算
  const convertToJPYSimulated = (value: number, currency: string) => {
    if (currency === 'USD') {
      return value * simExchangeRate;
    }
    return value;
  };

  // ポートフォリオサマリー計算（シミュレーション対応）
  const totalValue = assets.reduce((sum, a) => {
    const simPrice = getSimulatedPrice(a);
    return sum + convertToJPYSimulated(a.quantity * simPrice, a.currency);
  }, 0);
  const totalCost = assets.reduce((sum, a) => sum + convertToJPY(a.quantity * a.averageCost, a.currency), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // シミュレーションリセット
  const resetSimulation = () => {
    setSimExchangeRate(155);
    setSimMarketChange(0);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-full flex items-center justify-center glow-gradient">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AI ファンドマネージャー</h1>
                <p className="text-white/40 text-xs hidden sm:block">
                  インテリジェント ポートフォリオ分析
                </p>
              </div>
            </div>

            {/* アクション */}
            <div className="flex items-center gap-3">
              {isSimulating && (
                <span className="badge-warning text-xs hidden sm:inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  シミュレーション中
                </span>
              )}
              {isUsingDemo && (
                <span className="badge-warning text-xs hidden sm:inline-flex">
                  デモモード
                </span>
              )}
              <button
                onClick={() => setIsSimulationOpen(true)}
                className={`p-2.5 rounded-lg transition-colors ${isSimulating
                  ? 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
                  : 'text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                title="ストレステスト"
              >
                <Settings2 className="w-5 h-5" />
              </button>
              <button
                onClick={loadAssets}
                className="p-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="更新"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsGlossaryOpen(true)}
                className="p-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="用語解説"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-purple-blue text-white font-medium hover:scale-105 transition-transform btn-glow"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">銘柄追加</span>
              </button>
            </div>
          </div>
        </div>
      </header >

      {/* メインコンテンツ */}
      < main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24" >
        {activeTab === 'portfolio' ? (
          <>
            {/* ポートフォリオサマリー */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
              <div className="glass rounded-xl p-3 lg:p-4">
                <div className="text-white/40 text-xs lg:text-sm mb-1">評価額合計</div>
                <div className="text-lg lg:text-2xl font-bold text-white">
                  ¥{Math.round(totalValue).toLocaleString()}
                </div>
              </div>
              <div className="glass rounded-xl p-3 lg:p-4">
                <div className="text-white/40 text-xs lg:text-sm mb-1">投資額合計</div>
                <div className="text-lg lg:text-2xl font-bold text-white/70">
                  ¥{Math.round(totalCost).toLocaleString()}
                </div>
              </div>
              <div className="glass rounded-xl p-3 lg:p-4">
                <div className="text-white/40 text-xs lg:text-sm mb-1">含み損益</div>
                <div
                  className={`text-lg lg:text-2xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {totalGain >= 0 ? '+' : ''}¥{Math.round(totalGain).toLocaleString()}
                </div>
              </div>
              <div className="glass rounded-xl p-3 lg:p-4">
                <div className="text-white/40 text-xs lg:text-sm mb-1">リターン</div>
                <div
                  className={`text-lg lg:text-2xl font-bold ${totalGainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* メイングリッド - 2カラム（スマホはシングルカラム） */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* 左カラム - ポートフォリオ */}
              <div className="lg:col-span-5 space-y-4 lg:space-y-6">
                <div>
                  <h2 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple" />
                    アセット管理センター
                  </h2>
                  <PortfolioTable
                    assets={assets}
                    onEdit={handleEditAsset}
                    onDelete={handleDeleteAsset}
                    onUpdateNote={handleUpdateNote}
                    onRefresh={loadAssets}
                    isLoading={isLoading}
                  />
                </div>
                <PortfolioChart assets={assets} isLoading={isLoading} />
              </div>

              {/* 右カラム - AIアドバイザー（拡大） */}
              <div className="lg:col-span-7">
                <h2 className="text-base lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink" />
                  AI分析エンジン
                </h2>
                <AIAdvisorDisplay assets={assets} />
              </div>
            </div>
          </>
        ) : (
          /* 機関投資家タブ */
          <InstitutionalHoldings portfolioTickers={assets.map(a => a.ticker)} />
        )
        }
      </main >

      {/* フッター */}
      < footer className="border-t border-white/5 mb-20" >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white/30 text-sm">
              Next.js、Firebase、Google Gemini AI で構築
            </div>
            <div className="flex items-center gap-4 text-white/30 text-sm">
              <span>© 2026 AI ファンドマネージャー</span>
            </div>
          </div>
        </div>
      </footer >

      {/* 下部ナビゲーション */}
      < BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 銘柄追加/編集モーダル */}
      < AddAssetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
      />

      {/* 用語解説モーダル */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* シミュレーションパネル */}
      <SimulationPanel
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        exchangeRate={simExchangeRate}
        marketChange={simMarketChange}
        onExchangeRateChange={setSimExchangeRate}
        onMarketChangeChange={setSimMarketChange}
        onReset={resetSimulation}
      />
    </div >
  );
}
