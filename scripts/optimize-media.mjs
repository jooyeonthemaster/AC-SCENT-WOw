/**
 * 이미지 리사이즈 스크립트
 *
 * 소스 파일의 해상도만 줄이고 포맷은 유지합니다.
 * Next.js Image + Vercel이 AVIF/WebP 자동 변환을 처리하므로
 * 포맷 변환은 하지 않습니다.
 *
 * 사용법: node scripts/optimize-media.mjs
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const IMAGES_DIR = 'public/images'
const ORIGINALS_DIR = path.join(IMAGES_DIR, 'originals')

// 리사이즈 대상: 배경 이미지만 (3072px+ → 1920px)
// 봉투 이미지(1080x1080)는 이미 적절한 크기이므로 제외
const RESIZE_TARGETS = [
  {
    src: 'bg.png',
    maxWidth: 1920,
    format: 'png',
  },
  {
    src: 'bg2.jpeg',
    maxWidth: 1920,
    format: 'jpeg',
    quality: 95,
  },
  {
    src: 'shareback/backimage.png',
    maxWidth: 1920,
    format: 'png',
  },
]

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // already exists
  }
}

async function optimizeImage(target) {
  const srcPath = path.join(IMAGES_DIR, target.src)
  const backupPath = path.join(ORIGINALS_DIR, target.src)

  // 원본 존재 확인
  try {
    await fs.access(srcPath)
  } catch {
    console.log(`  SKIP: ${target.src} (파일 없음)`)
    return
  }

  // 원본 정보
  const srcStat = await fs.stat(srcPath)
  const srcSizeMB = (srcStat.size / (1024 * 1024)).toFixed(2)

  // 백업 디렉토리 확보
  const backupDir = path.dirname(backupPath)
  await ensureDir(backupDir)

  // 원본 백업 (이미 백업이 없을 때만)
  try {
    await fs.access(backupPath)
    console.log(`  INFO: ${target.src} 백업 이미 존재`)
  } catch {
    await fs.copyFile(srcPath, backupPath)
    console.log(`  BACKUP: ${target.src} → originals/`)
  }

  // 리사이즈 — 버퍼 기반으로 파일 잠금 방지
  const inputBuffer = await fs.readFile(srcPath)
  let pipeline = sharp(inputBuffer).resize({
    width: target.maxWidth,
    withoutEnlargement: true,
  })

  if (target.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: target.quality || 95, mozjpeg: true })
  } else if (target.format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9 })
  }

  const outputBuffer = await pipeline.toBuffer()

  // 임시 파일에 쓴 뒤 교체 (OneDrive 잠금 방지)
  const tmpPath = srcPath + '.tmp'
  await fs.writeFile(tmpPath, outputBuffer)
  await fs.unlink(srcPath)
  await fs.rename(tmpPath, srcPath)

  const newSizeMB = (outputBuffer.length / (1024 * 1024)).toFixed(2)
  const reduction = ((1 - outputBuffer.length / srcStat.size) * 100).toFixed(1)

  console.log(`  DONE: ${target.src} — ${srcSizeMB}MB → ${newSizeMB}MB (${reduction}% 절감)`)
}

async function main() {
  console.log('\n=== 이미지 최적화 시작 ===\n')
  await ensureDir(ORIGINALS_DIR)

  for (const target of RESIZE_TARGETS) {
    await optimizeImage(target)
  }

  console.log('\n=== 완료 ===\n')
}

main().catch(console.error)
