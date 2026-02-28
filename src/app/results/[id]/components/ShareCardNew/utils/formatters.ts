// 텍스트 줄바꿈 함수 (20자 기준)
export function formatDescription(text: string): string {
    if (!text) return ''
    const firstSentence = text.split(/[.!?]/)[0] + (text.match(/[.!?]/)?.[0] || '')

    const lines = []
    for (let i = 0; i < firstSentence.length; i += 20) {
        lines.push(firstSentence.slice(i, i + 20))
    }
    return lines.join('\n')
}
