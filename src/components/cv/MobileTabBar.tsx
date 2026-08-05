interface MobileTabBarProps {
  mode: 'editor' | 'preview'
  onChange: (mode: 'editor' | 'preview') => void
}

export function MobileTabBar({ mode, onChange }: MobileTabBarProps) {
  return (
    <div className="print-hide fixed bottom-4.5 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full bg-ink p-1.5 lg:hidden">
      {(['editor', 'preview'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-full px-5.5 py-2.5 font-display text-[13px] font-bold capitalize ${
            mode === tab ? 'bg-signal text-ink' : 'text-paper/65'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
