# Bridge Us App

iOS/Android 向けクロスプラットフォームアプリ（Expo + TypeScript）。

## セットアップ

Windows PowerShell で以下を実行:

```powershell
Set-Location "c:\Users\H.S\Programming\TypeScript-ReactNative\bridge-us-app"
# 依存解決（初回や更新時）
npm install
# 開発サーバ起動（Expo）
npx expo start
```

- iOS は macOS 以外ではビルド不可ですが、Expo Go での動作確認は可能です。
- Android は `npm run android` でエミュレータ起動（Android Studio セットアップが必要）。

## 実装済み
- React Navigation 導入（Bottom Tabs + Stack）
- 画面雛形:
  - ウォークスルー（`WalkthroughScreen`）
  - おねがいタスク一覧/詳細（`TasksListScreen` / `TaskDetailScreen`）
  - チャット（`ChatScreen`）
  - 通知（`NotificationsScreen`）
  - プロフィール（`ProfileScreen`）
 - 初回表示制御: `AsyncStorage` に `hasSeenWalkthrough` を保存/読み込みして初回のみウォークスルー表示
 - モックAPI: `src/api/tasks.ts` で一覧/詳細のデータ取得を擬似実装

## Firebase 接続
1. Firebase コンソールで Web アプリの構成値を取得（API キー等）
2. `bridge-us-app/.env` を作成し、以下のサンプルを埋める（`.env.example` を参照）
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```
3. 依存導入（済みでなければ）
```powershell
Set-Location "c:\Users\H.S\Programming\TypeScript-ReactNative\bridge-us-app"
npm install firebase
```
4. 設定: [src/config/firebase.ts](src/config/firebase.ts) が環境変数を読み込み、`auth`/`db` を初期化します（ReactNativePersistence を使用）
5. チャット購読/送信（Firestore）: [src/api/chat-firebase.ts](src/api/chat-firebase.ts) の `subscribeMessages` / `sendMessage`

注意: Firestore と Authentication を Firebase コンソールで有効化し、ルールを適切に設定してください。

## ナビゲーション構成
- Tabs: タスク / チャット / 通知 / プロフィール
- タスク配下に Stack（一覧 → 詳細）

## 初回表示制御について
- 初回起動時にウォークスルーを表示、`はじめる` を押すと `AsyncStorage` に `hasSeenWalkthrough=true` を保存し、次回以降は `MainTabs` から開始します。

## 開発メモ
- ウォークスルーを再度確認したい場合は以下でフラグを削除してください。
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('hasSeenWalkthrough');
```

## 識別子
- iOS `bundleIdentifier`: `com.bridgeus`
- Android `applicationId(package)`: `com.bridgeus`

## 注意
- `react-native-gesture-handler` を `index.ts` の先頭で読み込み済み
- `react-native-reanimated` の Babel プラグインを有効化（`babel.config.js`）
