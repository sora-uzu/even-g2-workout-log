# even-g2-workout-log

Even G2（スマートグラス）で動く、筋トレの回数記録アプリです。Even Hub の公式テンプレート（minimal）をもとに、日本語表示と記録画面を作りました。作りかけです。

## できること（Day1：背中）

種目：ラットプルダウン（目標8回）、ロングプル（目標8回）、ストレートアーム（目標10回）。各3セット。

| 操作 | 動き |
|---|---|
| タップ | 回数 +1 |
| 下スクロール | セットを確定（3セット終わると次の種目へ） |
| 上スクロール | やり直し（数えている途中なら 0 に戻す。なければ、直前のセットを取り消す） |
| ダブルタップ | 終了 |

記録は、その日の分を、WebView の localStorage に保存します。

## 動かし方

```bash
npm install
npm run dev
```

- シミュレーター：別のターミナルで `npm run simulate`（環境によっては、`node node_modules/@evenrealities/evenhub-simulator/bin/index.js http://localhost:5173`）
- 実機（G2）：`npx evenhub qr --url http://<PCのLAN IP>:5173` を実行し、Even Realities アプリの Even Hub タブ → Scan QR で読み取る（スマホと PC は同じ Wi-Fi）

## 今後

- 重量の記録
- Day2（肩胸）・Day3（自宅）の追加
- 前回の記録の表示

## 注意

- このアプリは、個人用の実験です。医療・健康上の判断には使わないでください。
- ライセンスは、未設定です（もとにしたテンプレートのライセンスを確認中）。
