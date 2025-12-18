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

## ナビゲーション構成
- Tabs: タスク / チャット / 通知 / プロフィール
- タスク配下に Stack（一覧 → 詳細）

## 識別子
- iOS `bundleIdentifier`: `com.bridgeus`
- Android `applicationId(package)`: `com.bridgeus`

## 注意
- `react-native-gesture-handler` を `index.ts` の先頭で読み込み済み
- `react-native-reanimated` の Babel プラグインを有効化（`babel.config.js`）
