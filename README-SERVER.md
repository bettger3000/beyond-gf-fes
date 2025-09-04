# Beyond GF Festival - 自動保存機能付き管理システム

## 🎉 新機能: shops.json自動更新

店舗管理画面で行った変更が、自動的に`shops.json`ファイルに保存されるようになりました！

## 🚀 サーバーの起動方法

### 方法1: スタートスクリプトを使用
```bash
./start-server.sh
```

### 方法2: 手動でサーバー起動
```bash
npm install    # 初回のみ
npm start
```

### 方法3: 開発モード（自動リロード）
```bash
npm run dev
```

## 📍 アクセス先

- **メインサイト**: http://localhost:4000
- **管理パネル**: http://localhost:4000/admin.html

## ✨ 自動保存機能

### 管理画面での変更
- 新規店舗追加
- 店舗情報編集  
- 店舗削除
- 画像アップロード

これらの操作は全て自動的に`shops.json`ファイルに反映されます。

### バックアップ機能
変更前のデータは自動的にバックアップされます：
- ファイル形式: `shops-backup-YYYY-MM-DDTHH-MM-SS.json`
- 保存場所: プロジェクトルート

## 🔧 API仕様

### GET /api/shops
全店舗データを取得
```javascript
fetch('/api/shops')
  .then(response => response.json())
  .then(shops => console.log(shops));
```

### POST /api/shops
全店舗データを更新
```javascript
fetch('/api/shops', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(shopsArray)
});
```

### POST /api/shops/:id
個別店舗を更新

### DELETE /api/shops/:id
店舗を削除

## 🔌 オフライン時の動作

サーバーが起動していない場合：
- 読み込みは`shops.json`から直接行われます
- 変更は保存されません（手動エクスポートが必要）
- 管理画面に警告メッセージが表示されます

## 🛠 技術仕様

- **バックエンド**: Node.js + Express
- **フロントエンド**: Vanilla JavaScript
- **データ形式**: JSON
- **画像形式**: Base64（LocalStorage + JSON保存）

## ⚠️ 注意事項

1. **サーバー起動**: 自動保存にはサーバーが必要です
2. **ポート**: 4000番ポートが使用されます
3. **画像サイズ**: 5MB制限があります
4. **バックアップ**: 定期的にバックアップファイルを整理してください

## 🎯 推奨ワークフロー

1. サーバーを起動 (`./start-server.sh`)
2. 管理画面で店舗情報を編集
3. 変更は自動的に保存される
4. メインサイトで確認
5. 必要に応じてGitでコミット

これで、面倒な手動エクスポート作業は不要になりました！🎉