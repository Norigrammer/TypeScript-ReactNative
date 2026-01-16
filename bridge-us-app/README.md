# Bridge Us App

iOS/Android 向けクロスプラットフォームアプリ（Expo + TypeScript）

企業の抱える簡単なタスクを社会進出にモヤモヤを抱いている大学生が主体的に参加して消化することで、企業はタスクの消化を、大学生は社会進出への前向きな体験を得られるモバイルアプリケーションです。

## ディレクトリ構成

```
bridge-us-app/
├── src/
│   ├── api/                      # API層
│   │   ├── tasks-firebase.ts     # タスク関連API
│   │   ├── chat-firebase.ts      # チャット関連API
│   │   ├── notifications-firebase.ts
│   │   ├── applications-firebase.ts
│   │   └── users-firebase.ts
│   ├── components/               # 共通コンポーネント
│   │   ├── themed-text.tsx       # テーマ対応テキスト
│   │   ├── themed-view.tsx       # テーマ対応ビュー
│   │   ├── ApplicationModal.tsx  # 応募モーダル
│   │   └── ui/                   # UIパーツ
│   ├── config/                   # 設定
│   │   └── firebase.ts           # Firebase初期化
│   ├── constants/                # 定数
│   │   ├── theme.ts              # テーマ設定
│   │   └── avatars.ts            # アバター定数
│   ├── contexts/                 # Context
│   │   └── AuthContext.tsx       # 認証状態管理
│   ├── hooks/                    # カスタムフック
│   │   ├── useThemeColor.ts
│   │   ├── useUnreadChats.ts
│   │   └── useUnreadNotifications.ts
│   ├── navigation/               # ナビゲーション
│   │   └── RootNavigator.tsx     # ルートナビゲーター
│   ├── screens/                  # 画面
│   │   ├── WalkthroughScreen.tsx # ウォークスルー
│   │   ├── LoginScreen.tsx       # ログイン
│   │   ├── RegisterScreen.tsx    # 新規登録
│   │   ├── TasksListScreen.tsx   # おねがいタスク一覧
│   │   ├── TaskDetailScreen.tsx  # おねがいタスク詳細
│   │   ├── ChatScreen.tsx        # チャット一覧
│   │   ├── ChatRoomScreen.tsx    # チャットルーム
│   │   ├── NotificationsScreen.tsx
│   │   ├── ProfileScreen.tsx     # プロフィール
│   │   ├── FavoritesScreen.tsx   # お気に入り
│   │   ├── MyApplicationsScreen.tsx
│   │   └── company/              # 企業向け画面
│   │       ├── MyTasksListScreen.tsx
│   │       ├── CreateTaskScreen.tsx
│   │       ├── EditTaskScreen.tsx
│   │       ├── TaskApplicationsScreen.tsx
│   │       └── CompanyProfileScreen.tsx
│   └── types/                    # 型定義
│       ├── task.ts
│       ├── chat.ts
│       ├── notification.ts
│       └── application.ts
├── assets/                       # 静的アセット
├── scripts/                      # スクリプト
├── App.tsx                       # エントリポイント
├── index.ts
└── package.json
```

## ナビゲーション構成

```
┌─────────────────────────────────────────────────────────────┐
│                      RootNavigator                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  認証フロー (未ログイン)              │    │
│  │  Walkthrough → UserTypeSelection → Login/Register   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               MainTabs (大学生向け)                  │    │
│  │  ┌─────────┬─────────┬──────────┬──────────┐        │    │
│  │  │  Tasks  │  Chat   │  通知    │ Profile  │        │    │
│  │  │ (Stack) │ (Stack) │          │ (Stack)  │        │    │
│  │  └────┬────┴────┬────┴──────────┴────┬─────┘        │    │
│  │       │         │                    │              │    │
│  │    一覧 →詳細  一覧→ルーム        設定→編集        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               CompanyTabs (企業向け)                 │    │
│  │  ┌─────────┬─────────┬──────────┬──────────┐        │    │
│  │  │ MyTasks │  Chat   │  通知    │ Profile  │        │    │
│  │  │ (Stack) │ (Stack) │          │ (Stack)  │        │    │
│  │  └────┬────┴────┬────┴──────────┴────┬─────┘        │    │
│  │       │         │                    │              │    │
│  │  一覧→作成/編集 一覧→ルーム        設定→編集        │    │
│  │    →応募者一覧                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## データフロー

```
┌──────────┐    ┌──────────┐    ┌───────────────┐    ┌───────────┐
│  Screen  │───▶│  Hooks   │───▶│  API Layer    │───▶│ Firestore │
│          │◀───│          │◀───│  (Firebase)   │◀───│           │
└──────────┘    └──────────┘    └───────────────┘    └───────────┘
                     │
                     ▼
              ┌──────────────┐
              │ AuthContext  │
              │  (認証状態)   │
              └──────────────┘
```

## セットアップ

### 1. 依存関係のインストール

```bash
cd bridge-us-app
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、Firebase の設定値を入力:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. 開発サーバーの起動

```bash
npx expo start
```

### 4. アプリの実行

- **iOS**: Expo Go アプリでQRコードをスキャン（macOS以外ではビルド不可）
- **Android**: `npm run android` でエミュレータ起動、または Expo Go アプリ使用

## Firebase 設定

### 必要なサービス

1. **Authentication**: Email/Password 認証を有効化
2. **Cloud Firestore**: データベースを作成
3. **Storage**: プロフィール画像保存用（オプション）

### Firestore コレクション

```
firestore/
├── users/                  # ユーザー情報
├── tasks/                  # おねがいタスク
├── applications/           # 応募情報
├── chatRooms/              # チャットルーム
│   └── {roomId}/messages/  # メッセージ
└── notifications/          # 通知
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm start` | Expo 開発サーバー起動 |
| `npm run android` | Android エミュレータで起動 |
| `npm run ios` | iOS シミュレータで起動 |
| `npm run web` | Web ブラウザで起動 |
| `npm run seed:tasks` | タスクのシードデータを投入 |

## 識別子

| プラットフォーム | 識別子 |
|-----------------|--------|
| iOS bundleIdentifier | `com.bridgeus` |
| Android package | `com.bridgeus` |

## 実装済み機能

### 大学生向け
- ウォークスルー（初回表示制御）
- ログイン / 新規登録 / パスワードリセット
- おねがいタスク一覧・詳細・お気に入り
- おねがいタスクへの応募
- 企業とのチャット
- 通知受信
- プロフィール編集

### 企業向け
- タスク管理ダッシュボード
- タスクの作成・編集・削除
- 応募者一覧の確認・ステータス更新
- 大学生とのチャット
- プロフィール編集

## 技術的な注意点

- `react-native-gesture-handler` を `index.ts` の先頭で読み込み済み
- `react-native-reanimated` の Babel プラグインを有効化（`babel.config.js`）
- Firebase の ReactNativePersistence を使用して認証状態を永続化

## 開発メモ

### ウォークスルーを再表示する

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('hasSeenWalkthrough');
```

### キャッシュクリア起動

```bash
npx expo start -c
```
