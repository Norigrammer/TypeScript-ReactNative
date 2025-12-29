/**
 * SVGからPNGへの変換スクリプト
 *
 * 使用方法:
 * 1. npm install sharp をインストール
 * 2. node scripts/convert-icons.js を実行
 */

const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('sharpがインストールされていません。');
    console.log('以下のコマンドでインストールしてください:');
    console.log('  npm install sharp');
    return;
  }

  const assetsDir = path.join(__dirname, '..', 'assets');

  // メインアイコンの変換
  const mainConversions = [
    { input: 'icon.svg', output: 'icon.png', width: 1024, height: 1024 },
    { input: 'adaptive-icon.svg', output: 'adaptive-icon.png', width: 1024, height: 1024 },
    { input: 'splash-icon.svg', output: 'splash-icon.png', width: 512, height: 512 },
    { input: 'icon.svg', output: 'favicon.png', width: 48, height: 48 },
  ];

  console.log('=== メインアイコンの変換 ===');
  for (const conv of mainConversions) {
    const inputPath = path.join(assetsDir, conv.input);
    const outputPath = path.join(assetsDir, conv.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`スキップ: ${conv.input} が見つかりません`);
      continue;
    }

    try {
      await sharp(inputPath)
        .resize(conv.width, conv.height)
        .png()
        .toFile(outputPath);
      console.log(`変換完了: ${conv.input} → ${conv.output}`);
    } catch (err) {
      console.error(`エラー: ${conv.input} の変換に失敗しました`, err.message);
    }
  }

  // 学生アバターの変換
  console.log('\n=== 学生アバターの変換 ===');
  const studentDir = path.join(assetsDir, 'avatars', 'student');
  if (fs.existsSync(studentDir)) {
    for (let i = 1; i <= 10; i++) {
      const inputPath = path.join(studentDir, `student-${i}.svg`);
      const outputPath = path.join(studentDir, `student-${i}.png`);

      if (!fs.existsSync(inputPath)) {
        console.log(`スキップ: student-${i}.svg が見つかりません`);
        continue;
      }

      try {
        await sharp(inputPath)
          .resize(200, 200)
          .png()
          .toFile(outputPath);
        console.log(`変換完了: student-${i}.svg → student-${i}.png`);
      } catch (err) {
        console.error(`エラー: student-${i}.svg の変換に失敗しました`, err.message);
      }
    }
  }

  // 企業アバターの変換
  console.log('\n=== 企業アバターの変換 ===');
  const companyDir = path.join(assetsDir, 'avatars', 'company');
  if (fs.existsSync(companyDir)) {
    for (let i = 1; i <= 10; i++) {
      const inputPath = path.join(companyDir, `company-${i}.svg`);
      const outputPath = path.join(companyDir, `company-${i}.png`);

      if (!fs.existsSync(inputPath)) {
        console.log(`スキップ: company-${i}.svg が見つかりません`);
        continue;
      }

      try {
        await sharp(inputPath)
          .resize(200, 200)
          .png()
          .toFile(outputPath);
        console.log(`変換完了: company-${i}.svg → company-${i}.png`);
      } catch (err) {
        console.error(`エラー: company-${i}.svg の変換に失敗しました`, err.message);
      }
    }
  }

  console.log('\nすべての変換が完了しました！');
}

convertSvgToPng();
