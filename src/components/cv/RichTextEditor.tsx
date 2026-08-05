import { useRef } from 'react'
import { Bold, Italic, List, Underline } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  function exec(command: string) {
    ref.current?.focus()
    document.execCommand(command)
    onChange(ref.current?.innerHTML ?? '')
  }

  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <div className="flex gap-1 border-b border-hairline bg-paper px-2 py-1.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('bold')}
          className="flex h-6 w-6 items-center justify-center rounded text-ink hover:bg-white"
          aria-label="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('italic')}
          className="flex h-6 w-6 items-center justify-center rounded text-ink hover:bg-white"
          aria-label="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('underline')}
          className="flex h-6 w-6 items-center justify-center rounded text-ink hover:bg-white"
          aria-label="Underline"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('insertUnorderedList')}
          className="flex h-6 w-6 items-center justify-center rounded text-ink hover:bg-white"
          aria-label="Bulleted list"
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>
      <div
        ref={ref}
        className="min-h-[70px] px-3 py-2.5 text-sm leading-relaxed text-ink outline-none empty:before:text-slate empty:before:content-[attr(data-placeholder)]"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  )
}
