// Seed Firestore with sample tasks
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Try env first; if missing, fallback to app.json's expo.extra.firebase
let cfg = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingEnv = Object.entries(cfg).filter(([_, v]) => !v).map(([k]) => k);
if (missingEnv.length) {
  // Read app.json
  const appJsonPath = path.resolve(__dirname, '..', 'app.json');
  if (fs.existsSync(appJsonPath)) {
    try {
      const raw = fs.readFileSync(appJsonPath, 'utf-8');
      const appJson = JSON.parse(raw);
      const extra = (appJson && appJson.expo && appJson.expo.extra && appJson.expo.extra.firebase) || {};
      cfg = {
        apiKey: cfg.apiKey || extra.apiKey,
        authDomain: cfg.authDomain || extra.authDomain,
        projectId: cfg.projectId || extra.projectId,
        storageBucket: cfg.storageBucket || extra.storageBucket,
        messagingSenderId: cfg.messagingSenderId || extra.messagingSenderId,
        appId: cfg.appId || extra.appId,
      };
    } catch (e) {
      console.warn('Failed to read app.json for firebase config fallback:', e.message);
    }
  }
}

const missing = Object.entries(cfg).filter(([_, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('Firebase config missing:', missing.join(', '));
  console.error('Populate .env with EXPO_PUBLIC_* keys or set app.json expo.extra.firebase and retry.');
  process.exit(1);
}

const app = initializeApp(cfg);
const db = getFirestore(app);

const sampleTasks = [
  {
    title: 'SNS運用サポート',
    company: 'BridgeUs 株式会社',
    description: '企業アカウントの投稿案作成と簡単な分析レポート作成。',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    reward: 5000,
    category: 'マーケティング',
  },
  {
    title: 'イベントチラシのデザイン',
    company: '未来企画合同会社',
    description: 'A4サイズのイベントチラシのデザイン案を3案提出。',
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    reward: 8000,
    category: 'デザイン',
  },
  {
    title: 'ユーザーインタビュー文字起こし',
    company: 'グロースラボ',
    description: '録音データの文字起こしと気づきのサマリー。',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    reward: 3000,
    category: 'リサーチ',
  },
  {
    title: '競合サイト調査',
    company: 'TechBridge Inc.',
    description: '指定業界の競合5社のサイト分析レポート。',
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    reward: 7000,
    category: 'リサーチ',
  },
  {
    title: 'LP文案の叩き台作成',
    company: 'クリエイトワークス',
    description: 'サービスLPのファーストドラフト（構成・見出し・本文）。',
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    reward: 6000,
    category: 'ライティング',
  },
];

(async () => {
  try {
    const colRef = collection(db, 'tasks');
    for (const t of sampleTasks) {
      await addDoc(colRef, {
        ...t,
        createdAt: serverTimestamp(),
      });
    }
    console.log(`Seeded ${sampleTasks.length} tasks into Firestore`);
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  }
})();
