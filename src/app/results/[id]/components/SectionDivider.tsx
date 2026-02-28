const serifFont = { fontFamily: 'Times New Roman, Georgia, serif' }

interface SectionDividerProps {
  title: string
  accent?: boolean
}

export function SectionDivider({ title, accent }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-2.5 my-5">
      <div className="flex-1 h-[1px] bg-[#E0E0E0]" />
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5"
          style={{ backgroundColor: accent ? '#BB0000' : '#1A1A1A' }}
        />
        <span
          className="text-[10px] tracking-[0.3em] font-bold uppercase"
          style={{
            ...serifFont,
            color: accent ? '#BB0000' : '#999',
          }}
        >
          {title}
        </span>
        <span
          className="w-1.5 h-1.5"
          style={{ backgroundColor: accent ? '#BB0000' : '#1A1A1A' }}
        />
      </div>
      <div className="flex-1 h-[1px] bg-[#E0E0E0]" />
    </div>
  )
}
