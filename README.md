<h1 align="center">Bridge Us App</h1>

企業と大学生をつなぐタスクマッチングプラットフォーム

参考画像: Bridge Us App - アプリ画面
<img width="914" height="507" alt="Bridge Us App_アプリ画面" src="https://github.com/user-attachments/assets/851a36e3-e954-4537-b7e3-881a0513562d" />

## 概要

**Bridge Us** は、企業の抱える簡単なタスクを社会進出にモヤモヤを抱いている大学生が主体的に参加して消化することで、企業はタスクの消化を、大学生は社会進出への前向きな体験を得られるクロスプラットフォームアプリケーションです。

## 構成図

```
TypeScript-ReactNative/
├── bridge-us-app/                # メインアプリケーション
│   ├── src/
│   │   ├── api/                  # API層 (Firebase連携)
│   │   │   ├── tasks-firebase.ts
│   │   │   ├── chat-firebase.ts
│   │   │   ├── notifications-firebase.ts
│   │   │   ├── applications-firebase.ts
│   │   │   └── users-firebase.ts
│   │   ├── components/           # 共通UIコンポーネント
│   │   │   ├── themed-text.tsx
│   │   │   ├── themed-view.tsx
│   │   │   └── ui/
│   │   ├── config/               # 設定ファイル
│   │   │   └── firebase.ts
│   │   ├── constants/            # 定数・テーマ
│   │   │   ├── theme.ts
│   │   │   └── avatars.ts
│   │   ├── contexts/             # React Context
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/                # カスタムフック
│   │   │   ├── useThemeColor.ts
│   │   │   ├── useUnreadChats.ts
│   │   │   └── useUnreadNotifications.ts
│   │   ├── navigation/           # ナビゲーション設定
│   │   │   └── RootNavigator.tsx
│   │   ├── screens/              # 画面コンポーネント
│   │   │   ├── TasksListScreen.tsx
│   │   │   ├── TaskDetailScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── company/          # 企業向け画面
│   │   │       ├── MyTasksListScreen.tsx
│   │   │       ├── CreateTaskScreen.tsx
│   │   │       └── TaskApplicationsScreen.tsx
│   │   └── types/                # TypeScript型定義
│   ├── assets/                   # 画像・アイコン
│   ├── scripts/                  # ユーティリティスクリプト
│   ├── App.tsx                   # アプリエントリポイント
│   ├── index.ts
│   └── package.json
├── .github/                      # GitHub Actions設定
└── CLAUDE.md                     # 開発ガイドライン
```

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile App                               │
│                   (Expo + React Native)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Screens   │  │  Components │  │      Navigation         │  │
│  │ (大学生/企業)│  │   (共通UI)  │  │   (Tabs + Stack)        │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                     │                │
│         └────────────────┼─────────────────────┘                │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                    Context / Hooks                        │  │
│  │              (AuthContext, useUnreadChats, etc.)          │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                      API Layer                            │  │
│  │         (tasks, chat, notifications, applications)        │  │
│  └───────────────────────┬───────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Firebase                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Authentication  │  │   Firestore     │  │    Storage      │  │
│  │  (Email/匿名)   │  │   (データベース) │  │   (画像保存)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | TypeScript |
| フレームワーク | React Native (Expo SDK 54) |
| ナビゲーション | React Navigation (Stack + Bottom Tabs) |
| 認証 | Firebase Authentication |
| データベース | Cloud Firestore |
| ストレージ | Firebase Storage |
| 状態管理 | React Context |

## 主な機能

### 大学生向け
- **おねがいタスク一覧**: 企業から依頼されるタスクの閲覧・検索
- **おねがいタスク詳細**: タスクの詳細確認・応募
- **応募管理**: 現在応募しているタスクの状況確認
- **チャット**: 企業とのコミュニケーション
- **通知**: タスクの進捗や新着タスクの通知
- **プロフィール管理**: ユーザー情報の表示・編集

### 企業向け
- **タスク管理ダッシュボード**: タスクの進捗管理・応募者管理
- **タスク作成・編集**: 新しいおねがいタスクの作成・編集
- **応募者管理**: 応募してきた大学生の一覧表示・管理
- **チャット**: 大学生とのコミュニケーション
- **プロフィール管理**: 企業情報の表示・編集

## セットアップ

詳細なセットアップ手順は [bridge-us-app/README.md](./bridge-us-app/README.md) を参照してください。

### クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/your-username/TypeScript-ReactNative.git
cd TypeScript-ReactNative/bridge-us-app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npx expo start
```

## ライセンス

Private - All rights reserved
