# Beyond Gluten-Free Festival

ビヨンドグルテンフリー祭り公式サイト - 完全Cloudflareスタック構成

## 🌐 サイト情報

- **メインサイト**: https://gf-fes.com
- **管理画面**: https://gf-fes.com/admin.html
- **開催日**: 2025.10.10

## 🏗️ システム構成

### Cloudflare フルスタック

- **Pages**: フロントエンドホスティング
- **Workers**: API実装
- **D1**: データベース（店舗情報）
- **R2**: 画像ストレージ

### コスト

**月額 ¥0** - 全て無料枠内で運用

## 📊 店舗情報

現在 **9店舗** が参加登録済み

- とまり來 (米粉ケーキ)
- どらカフェ三幸 (どらやき)
- rucipio (豆腐マフィン)
- くまさん家。のこめこぱん (美腸活パン)
- 2525sweets (フィナンシェ)
- 菜食食堂ととと (お好み焼き)
- 米粉パンケーキ sora 1-na cafe
- 米粉のおやつ ココカラ日和
- やさしいスイーツカフェ corpo

## 🛠️ 開発・管理

### API エンドポイント

```
GET  /api/shops           # 店舗一覧取得
POST /api/shops           # 店舗データ更新  
POST /api/upload-image    # 画像アップロード
GET  /api/image/{name}    # 画像取得
```

### ローカル開発

```bash
# サーバー起動
npm start

# Workers開発
cd cloudflare-worker
wrangler dev
```

### デプロイ

```bash
# Pages
wrangler pages deploy cloudflare-pages

# Workers
cd cloudflare-worker
wrangler deploy
```

## 📝 ライセンス

© 2025 Beyond Gluten-Free Festival