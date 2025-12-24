# プロジェクト設定

## アーキテクチャ

### フロントエンド
- 言語: TypeScript（設定は tsconfig.json）
- フレームワーク: React Native（Expo SDK 54、エントリは index.ts と App.tsx）
- ナビゲーション: React Navigation（Stack/Bottom Tabs、RootNavigator）
- UI基盤: テーマ対応（constants/theme.ts、ThemedView、ThemedText）
- 端末連携: react-native-gesture-handler, react-native-reanimated, react-native-screens, react-native-safe-area-context
- ストレージ: 初回表示制御に @react-native-async-storage/async-storage（ウォークスルーは WalkthroughScreen）
- 画面構成: タスク一覧/詳細（TasksListScreen, TaskDetailScreen）、チャット/通知/プロフィール

### バックエンド
- 認証: Firebase Authentication（匿名/Email/Google 等）
- データ: Cloud Firestore でチャットルーム＋メッセージ履歴、タスク状態も拡張可
- 通知: FCM（Expoの expo-notifications と併用。バックグラウンド通知は EAS Build 前提）
- プレゼンス: Realtime Database（オンライン/最終閲覧の管理に適用）
- ストレージ: Firebase Storage（プロフィール画像など）

## コーディング規約
- インデント: 2スペース
- ファイル命名: kebab-case
- 絶対パスではなく相対パスを使ってください

## よく使うコマンド
npx expo start    // Expo起動
npx expo start -c    // Expoキャッシュクリア起動
