import { buildSystemPromptWithPerfumes } from './systemPrompt'

type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'th' | 'id'

export interface PromptOptions {
  language?: SupportedLanguage
  analysisDepth?: 'quick' | 'detailed'
  enableCoT?: boolean
}

// 언어별 출력 지시 (자유 텍스트 필드만 대상 언어로)
// ⚠️ 시스템 프롬프트가 한국어 예시로 가득하므로, 비한국어 지시는 매우 강력해야 함
const LANGUAGE_INSTRUCTIONS: Record<SupportedLanguage, string> = {
  ko: '', // 한국어는 시스템 프롬프트 기본 언어이므로 추가 지시 불필요
  en: `

⚠️ CRITICAL: OUTPUT LANGUAGE = ENGLISH
All free-text fields MUST be written ENTIRELY in English. Do NOT use ANY Korean text.
Ignore the Korean examples above — adapt the same enthusiastic style but in English.

- "description": 3-4 sentences in English. Use enthusiastic, trendy fan language with emojis. (e.g., "This gaze is literally INSANE 🔥 The vibe is unreal!!")
- "personality": 1-2 sentences in English describing the image mood/atmosphere with emojis. (e.g., "A chic aura radiating from those sharp eyes, absolutely iconic ✨")
- "mood": 4 English keywords, each max 6 characters. Examples: "Classy", "Fierce", "Dreamy", "ItGirl", "Iconic", "Slay", "Chic", "Vibes"
- "matchReason": 2-3 sentences in English with enthusiastic fan language and emojis, connecting the person's traits to the perfume.

ZERO Korean in the output. Every text field must be 100% English.`,

  ja: `

⚠️ 重要: 出力言語 = 日本語
すべてのテキストフィールドは必ず日本語で書いてください。韓国語は絶対に使用禁止。
上記の韓国語の例は無視し、同じ熱量を日本語で表現してください。

- "description": 3-4文、推し語・オタク語で熱く書く（絵文字必須）例:「この眼差しやばすぎ🔥 ガチで優勝だわ!!」
- "personality": 1-2文、画像の雰囲気をビビッドに（絵文字必須）例:「クールな眼差しから溢れるシックなオーラ、マジ最強 ✨」
- "mood": 日本語キーワード4つ（各6文字以内）例:「シック」「最強」「推せる」「神ビジュ」
- "matchReason": 2-3文、人物の特徴と香水を熱く結びつけて（絵文字必須）

韓国語テキストは絶対に出力しないでください。すべて日本語で。`,

  'zh-CN': `

⚠️ 重要：输出语言 = 简体中文
所有文本字段必须用简体中文撰写。绝对不要使用韩语。
忽略上面的韩语示例，用同样的热情风格用中文表达。

- "description": 3-4句，用饭圈流行语和表情符号热情地写。例："这气场绝了🔥 颜值逆天!!"
- "personality": 1-2句描述图片氛围（表情符号必须）。例："眼神中散发的高冷气质，简直绝绝子 ✨"
- "mood": 4个中文关键词（每个最多6字）。例："绝美"、"氛围感"、"高冷"、"心动"
- "matchReason": 2-3句，用饭圈语言将人物特征与香水联系起来（表情符号必须）

绝对不要输出韩语文本。所有内容必须是100%简体中文。`,

  'zh-TW': `

⚠️ 重要：輸出語言 = 繁體中文
所有文字欄位必須用繁體中文撰寫。絕對不要使用韓語。
忽略上面的韓語範例，用同樣的熱情風格用中文表達。

- "description": 3-4句，用飯圈流行語和表情符號熱情地寫。例："這氣場絕了🔥 顏值逆天!!"
- "personality": 1-2句描述圖片氛圍（表情符號必須）。例："眼神中散發的高冷氣質，簡直太絕了 ✨"
- "mood": 4個中文關鍵詞（每個最多6字）。例："絕美"、"氛圍感"、"高冷"、"心動"
- "matchReason": 2-3句，用飯圈語言將人物特徵與香水聯繫起來（表情符號必須）

絕對不要輸出韓語文本。所有內容必須是100%繁體中文。`,

  th: `

⚠️ สำคัญ: ภาษาที่ใช้ = ภาษาไทย
ข้อความทั้งหมดต้องเขียนเป็นภาษาไทยเท่านั้น ห้ามใช้ภาษาเกาหลี
ไม่ต้องสนใจตัวอย่างภาษาเกาหลีข้างบน ใช้สไตล์กระตือรือร้นเหมือนกันแต่เป็นภาษาไทย

- "description": 3-4 ประโยค ใช้ภาษาแฟนคลับยุคใหม่พร้อมอีโมจิ เช่น "ออร่านี้ปังมาก🔥 วิชวลขั้นเทพ!!"
- "personality": 1-2 ประโยคบรรยายบรรยากาศของภาพพร้อมอีโมจิ เช่น "ออร่าเท่ๆ จากสายตาคม สุดปังจริงๆ ✨"
- "mood": 4 คำภาษาไทย (แต่ละคำไม่เกิน 6 ตัวอักษร) เช่น "ปัง", "คูล", "หล่อมาก", "ฟิน"
- "matchReason": 2-3 ประโยค เชื่อมลักษณะบุคคลกับน้ำหอมพร้อมอีโมจิ

ห้ามใช้ภาษาเกาหลีโดยเด็ดขาด ทุกข้อความต้องเป็นภาษาไทย 100%`,

  id: `

⚠️ PENTING: BAHASA OUTPUT = BAHASA INDONESIA
Semua kolom teks HARUS ditulis dalam Bahasa Indonesia. JANGAN gunakan bahasa Korea sama sekali.
Abaikan contoh bahasa Korea di atas — gunakan gaya antusias yang sama tapi dalam Bahasa Indonesia.

- "description": 3-4 kalimat, gunakan bahasa fans yang trendi dengan emoji. Contoh: "Aura ini gila banget🔥 Visual legend!!"
- "personality": 1-2 kalimat mendeskripsikan suasana gambar dengan emoji. Contoh: "Aura chic dari tatapan tajam itu, beneran iconic banget ✨"
- "mood": 4 kata kunci Bahasa Indonesia (maks 6 karakter). Contoh: "Keren", "Vibes", "Sultan", "Iconic"
- "matchReason": 2-3 kalimat menghubungkan ciri khas orang dengan parfum, dengan emoji.

JANGAN gunakan bahasa Korea. Semua teks harus 100% Bahasa Indonesia.`,
}

// moodCategories 지시: mood 키워드의 영어 시맨틱 카테고리를 함께 반환
const MOOD_CATEGORIES_INSTRUCTION = `

Additionally, include a "moodCategories" field: an array of English semantic category labels, one for each mood keyword, in the same order. Use categories from this list:
chic, dark, charisma, passion, sexy, leather, smoky, romantic, cute, soft, love, sweet, lovely, dreamy, elegant, mysterious, violet, cool, fresh, clean, calm, refreshing, clear, relaxed, free, comfortable, natural, herb, green, warm, cozy, bright, lively, vibrant, citrusy, sunshine, energy, refined, emotional, vintage, urban, luxury, classic, modern, pure, transparent, light, peppy, vitamin, woody, forest`

export function buildAnalysisPrompt(options?: PromptOptions): string {
  const basePrompt = buildSystemPromptWithPerfumes()
  const lang = options?.language || 'ko'

  const languageInstruction = LANGUAGE_INSTRUCTIONS[lang] || LANGUAGE_INSTRUCTIONS.ko
  const moodCategoriesInstruction = MOOD_CATEGORIES_INSTRUCTION

  const cotInstruction = options?.enableCoT
    ? '\n\n⚠️ 중요: 분석 전에 Step 1-5의 사고 과정을 내부적으로 반드시 수행한 후 최종 JSON만 출력하세요. 각 점수에 대한 근거를 명확히 한 후 출력하세요.'
    : ''

  const depthInstruction = options?.analysisDepth === 'detailed'
    ? '\n\n상세 분석 모드: 각 시각적 요소를 더욱 세밀하게 분석하고, 본질적 특성(얼굴, 눈빛, 분위기)에 특히 집중하세요.'
    : ''

  return basePrompt + languageInstruction + moodCategoriesInstruction + cotInstruction + depthInstruction
}
