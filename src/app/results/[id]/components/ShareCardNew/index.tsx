"use client"

import { forwardRef } from 'react'
import { ShareAnalysisData, TraitScores, TRAIT_ICONS } from '@/types/analysis'
import type { ScentCategoryScores } from '@/types/analysis'
import { SHARE_CARD_DIMENSIONS } from '../ShareModal/constants'
import { useTranslation } from '@/i18n/useTranslation'
import { useLocalizedPerfume } from '@/i18n/helpers/localizedPerfume'

// ── Constants ──

const TRAIT_COLORS: Record<string, string> = {
  sexy: '#E84057', cute: '#F48FB1', charisma: '#FF8F00',
  darkness: '#5C6BC0', freshness: '#26A69A', elegance: '#AB47BC',
  freedom: '#66BB6A', luxury: '#FFC107', purity: '#42A5F5', uniqueness: '#7E57C2',
}

const SCENT_EMOJI: Record<string, string> = {
  citrus: '🍋', floral: '🌸', woody: '🌲',
  musky: '🫧', fruity: '🍑', spicy: '🌶️',
}

const SCENT_LABEL: Record<string, string> = {
  citrus: 'Citrus', floral: 'Floral', woody: 'Woody',
  musky: 'Musky', fruity: 'Fruity', spicy: 'Spicy',
}

const SCENT_KEYS: (keyof ScentCategoryScores)[] = [
  'citrus', 'floral', 'woody', 'musky', 'fruity', 'spicy',
]

// ── Layout (px) — 모든 섹션 고정 크기, 독립 조정 가능 ──

const LAYOUT = {
  pad: 16,
  headerH: 40,
  headerLogoH: 26,
  scentInfoMt: 20,
  scentInfoH: 57,       // ② Scent Information 높이 (제목 없음)
  photoRowMt: 17,
  photoRowH: 280,        // ③ 사진 + 프로필 영역
  photoW: 208,           // 사진 너비
  profileW: 180,         // 오른쪽 프로필 컬럼 너비
  profileGap: 6,         // Image Profile ↔ Scent Profile 간격
  imageProfileH: 137,    // ⑥ Image Profile 높이
  scentProfileH: 137,    // ⑦ Scent Profile 높이
  imageStoryMt: 16,
  imageStoryH: 120,      // ④ Image Story 높이
  scentStoryMt: 16,
  scentStoryH: 120,      // ⑤ Scent Story 높이
  footerMt: 8,
  footerH: 32,
}

// ── Helpers ──

function fitFontSize(
  text: string, boxW: number, boxH: number, max: number, min: number,
): number {
  if (!text) return max
  const wideChars = (text.match(/[\u2E80-\u9FFF\uF900-\uFAFF\u0E00-\u0E7F\uAC00-\uD7AF]/g) || []).length
  const cw = 0.55 + (wideChars / text.length) * 0.45
  for (let s = max; s >= min; s--) {
    const cpl = Math.floor(boxW / (s * cw))
    const lines = Math.ceil(text.length / cpl)
    if (lines * s * 1.5 <= boxH) return s
  }
  return min
}

/** Static SVG circular progress (no framer-motion — for image capture) */
function Ring({ size, sw, progress, color, emoji, emojiSize }: {
  size: number; sw: number; progress: number
  color: string; emoji: string; emojiSize: number
}) {
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#F0F0F0" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: emojiSize,
      }}>
        {emoji}
      </div>
    </div>
  )
}

// ── Styles ──

const boxStyle: React.CSSProperties = {
  border: '2px solid #333',
  borderRadius: 16,
  backgroundColor: '#FFFDF8',
  boxShadow: '3px 3px 0px #333',
}

const LABEL_H = 26

const labelStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#666',
  letterSpacing: '0.08em',
  height: LABEL_H,
  textAlign: 'center',
}

// ── Component ──

interface ShareCardProps {
  userImage?: string
  twitterName: string
  userName: string
  userGender?: string
  perfumeName?: string
  perfumeBrand?: string
  analysisData: ShareAnalysisData
  accentColor?: string
  timestamp?: number
}

export const ShareCardNew = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCardNew(
    { userImage, twitterName, perfumeName, perfumeBrand, analysisData, accentColor = '#BB0000', timestamp },
    ref,
  ) {
    const { t } = useTranslation('common')
    const { getMainScent, getSubScent1, getSubScent2 } = useLocalizedPerfume()
    const { traits, matchingPerfumes, scentCategories } = analysisData
    const persona = matchingPerfumes?.[0]?.persona
    const personality = analysisData.personality || ''

    // Top 5 traits sorted by score
    const topTraits = (Object.entries(traits) as [keyof TraitScores, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Scent categories sorted by score
    const sortedScents = [...SCENT_KEYS]
      .sort((a, b) => (scentCategories[b] ?? 0) - (scentCategories[a] ?? 0))

    // Notes
    const notes = [
      { label: 'Top', name: persona?.id ? getMainScent(persona.id) : '-' },
      { label: 'Mid', name: persona?.id ? getSubScent1(persona.id) : '-' },
      { label: 'Base', name: persona?.id ? getSubScent2(persona.id) : '-' },
    ]

    // Date
    const d = timestamp ? new Date(timestamp) : new Date()
    const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

    // Auto font sizes — boxH must match actual content area (boxH - padding 24 - border 4 = 66)
    const storyContentH = 66
    const descFont = fitFontSize(twitterName, 362, storyContentH, 15, 7)
    const storyFont = fitFontSize(personality, 362, storyContentH, 15, 7)

    const W = SHARE_CARD_DIMENSIONS.width   // 430
    const H = SHARE_CARD_DIMENSIONS.height  // 932
    const L = LAYOUT

    // 내부 박스 높이 (라벨 높이 제외)
    const scentInfoBoxH = L.scentInfoH - LABEL_H
    const imageProfileBoxH = L.imageProfileH - LABEL_H
    const scentProfileBoxH = L.scentProfileH - LABEL_H
    const imageStoryBoxH = L.imageStoryH - LABEL_H
    const scentStoryBoxH = L.scentStoryH - LABEL_H

    return (
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
          backgroundColor: '#F5F0E8',
          padding: L.pad,
          boxSizing: 'border-box',
        }}
      >
        {/* ① Header — Logo (중앙) + 향수 번호 (우측) */}
        <div style={{
          position: 'relative',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          height: L.headerH,
        }}>
          <img
            src="/images/logo2.PNG"
            alt="AC'SCENT"
            style={{ height: L.headerLogoH, objectFit: 'contain', filter: 'invert(1)' }}
            crossOrigin="anonymous"
          />
          <span style={{
            position: 'absolute', left: '77%',
            fontSize: 24, fontWeight: 800, color: '#333',
          }}>
            #{(perfumeBrand || persona?.id || "AC'SCENT 00").replace("AC'SCENT ", '')}
          </span>
        </div>

        {/* ② Scent Information — 노트만 전체 너비 */}
        <div style={{ marginTop: L.scentInfoMt, height: L.scentInfoH }}>
          <div style={{
            ...boxStyle, borderRadius: 14,
            height: L.scentInfoH, boxSizing: 'border-box',
            position: 'relative',
          }}>
            {notes.map((n, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${25 + i * 25}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  color: i === 0 ? '#BB0000' : i === 1 ? '#E8A838' : '#6B7280',
                }}>
                  {n.label}
                </span>
                <span style={{
                  fontSize: 15, fontWeight: 600, color: '#555',
                  textAlign: 'center', lineHeight: 1.15,
                  wordBreak: 'keep-all', whiteSpace: 'nowrap',
                }}>
                  {n.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ③ Photo + (Image Profile + Scent Profile) */}
        <div style={{ display: 'flex', gap: 10, marginTop: L.photoRowMt, height: L.photoRowH }}>

          {/* Photo (polaroid frame) */}
          <div style={{
            ...boxStyle,
            width: L.photoW,
            height: L.photoRowH,
            padding: '6px 8px 8px 6px',
            boxSizing: 'border-box',
          }}>
            <div style={{
              width: L.photoW - 17, height: L.photoRowH - 17,
              borderRadius: 10, overflow: 'hidden', backgroundColor: '#f0f0f0',
            }}>
              {userImage ? (
                <img
                  src={userImage}
                  alt="user"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center top',
                    display: 'block',
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 12, color: '#bbb' }}>PHOTO</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Image Profile + Scent Profile */}
          <div style={{ width: L.profileW }}>

            {/* Image Profile */}
            <div style={{ height: L.imageProfileH }}>
              <div style={labelStyle}>IMAGE PROFILE</div>
              <div style={{
                ...boxStyle, borderRadius: 12, padding: '6px 4px',
                height: imageProfileBoxH, boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {topTraits.slice(0, 3).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Ring
                        size={38} sw={3.75} progress={val / 10}
                        color={TRAIT_COLORS[key] || '#999'}
                        emoji={TRAIT_ICONS[key as keyof TraitScores]}
                        emojiSize={17}
                      />
                      <span style={{
                        fontSize: 9, fontWeight: 700, marginTop: 1,
                        color: TRAIT_COLORS[key], whiteSpace: 'nowrap',
                      }}>
                        {t(`traits.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {topTraits.slice(3, 5).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Ring
                        size={32} sw={3} progress={val / 10}
                        color={TRAIT_COLORS[key] || '#999'}
                        emoji={TRAIT_ICONS[key as keyof TraitScores]}
                        emojiSize={15}
                      />
                      <span style={{
                        fontSize: 9, fontWeight: 700, marginTop: 1,
                        color: TRAIT_COLORS[key], whiteSpace: 'nowrap',
                      }}>
                        {t(`traits.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scent Profile */}
            <div style={{ height: L.scentProfileH, marginTop: L.profileGap }}>
              <div style={labelStyle}>SCENT PROFILE</div>
              <div style={{
                ...boxStyle, borderRadius: 12, padding: '6px 4px',
                height: scentProfileBoxH, boxSizing: 'border-box',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {sortedScents.slice(0, 3).map((key) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Ring
                        size={38} sw={3.75}
                        progress={(scentCategories[key] ?? 0) / 10}
                        color={accentColor}
                        emoji={SCENT_EMOJI[key] || '?'}
                        emojiSize={17}
                      />
                      <span style={{
                        fontSize: 9, fontWeight: 700, marginTop: 1,
                        color: '#555', whiteSpace: 'nowrap',
                      }}>
                        {SCENT_LABEL[key]}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {sortedScents.slice(3, 6).map((key) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Ring
                        size={32} sw={3}
                        progress={(scentCategories[key] ?? 0) / 10}
                        color={accentColor}
                        emoji={SCENT_EMOJI[key] || '?'}
                        emojiSize={15}
                      />
                      <span style={{
                        fontSize: 9, fontWeight: 700, marginTop: 1,
                        color: '#555', whiteSpace: 'nowrap',
                      }}>
                        {SCENT_LABEL[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ④ Image Story */}
        <div style={{ marginTop: L.imageStoryMt, height: L.imageStoryH }}>
          <div style={labelStyle}>IMAGE STORY</div>
          <div style={{
            ...boxStyle, padding: '12px 16px',
            height: imageStoryBoxH, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <p style={{
              fontSize: descFont, lineHeight: 1.5,
              color: '#333', margin: 0, textAlign: 'center',
              wordBreak: 'break-word', overflowWrap: 'break-word', width: '100%',
            }}>
              {twitterName}
            </p>
          </div>
        </div>

        {/* ⑤ Scent Story */}
        <div style={{ marginTop: L.scentStoryMt, height: L.scentStoryH }}>
          <div style={labelStyle}>SCENT STORY</div>
          <div style={{
            ...boxStyle, padding: '12px 16px',
            height: scentStoryBoxH, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <p style={{
              fontSize: storyFont, lineHeight: 1.5,
              color: '#333', margin: 0, textAlign: 'center',
              wordBreak: 'break-word', overflowWrap: 'break-word', width: '100%',
            }}>
              {personality || ''}
            </p>
          </div>
        </div>

        {/* ⑥ Footer */}
        <div style={{
          position: 'absolute',
          bottom: L.pad,
          left: L.pad,
          right: L.pad,
          height: L.footerH,
          display: 'flex', alignItems: 'center',
        }}>
          {/* 로고 — 정중앙 */}
          <div style={{
            position: 'absolute', left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
          }}>
            <img
              src="/images/template/footer.png"
              alt="AC'SCENT WOW"
              style={{ height: 14, objectFit: 'contain', opacity: 0.6 }}
              crossOrigin="anonymous"
            />
          </div>
          {/* 날짜 — 우측 정렬 */}
          <div style={{
            position: 'absolute',
            right: 0,
          }}>
            <span style={{ fontSize: 14, color: '#666', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              Date : {dateStr}
            </span>
          </div>
        </div>
      </div>
    )
  },
)
