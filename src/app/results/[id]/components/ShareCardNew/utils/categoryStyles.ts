export interface CategoryStyle {
    bg: string
    borderColor: string
    ringColor: string
    textColor: string
    dotColor: string
}

export function getCategoryStyles(cat: string): CategoryStyle {
    switch (cat) {
        case 'citrus':
            return {
                bg: '#fefce8',
                borderColor: '#fde047',
                ringColor: '#facc15',
                textColor: '#a16207',
                dotColor: '#facc15'
            }
        case 'fruity':
            return {
                bg: '#fef2f2',
                borderColor: '#fca5a5',
                ringColor: '#f87171',
                textColor: '#b91c1c',
                dotColor: '#f87171'
            }
        case 'spicy':
            return {
                bg: '#fff7ed',
                borderColor: '#fdba74',
                ringColor: '#fb923c',
                textColor: '#c2410c',
                dotColor: '#f97316'
            }
        case 'woody':
            return {
                bg: '#fffbeb',
                borderColor: '#fcd34d',
                ringColor: '#fbbf24',
                textColor: '#b45309',
                dotColor: '#f59e0b'
            }
        case 'musky':
            return {
                bg: '#faf5ff',
                borderColor: '#d8b4fe',
                ringColor: '#c084fc',
                textColor: '#7e22ce',
                dotColor: '#c084fc'
            }
        case 'floral':
            return {
                bg: '#fdf2f8',
                borderColor: '#f9a8d4',
                ringColor: '#f472b6',
                textColor: '#be185d',
                dotColor: '#f472b6'
            }
        default:
            return {
                bg: '#f8fafc',
                borderColor: '#cbd5e1',
                ringColor: '#94a3b8',
                textColor: '#334155',
                dotColor: '#94a3b8'
            }
    }
}
