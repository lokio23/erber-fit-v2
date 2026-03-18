import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import FORM_GUIDES from '../data/formGuides'

export default function FormGuide({ exerciseId }) {
  const [open, setOpen] = useState(false)
  const guide = FORM_GUIDES[exerciseId]

  if (!guide) return null

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-mono text-muted uppercase tracking-wider hover:text-text transition-colors"
      >
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
        />
        Form Guide
      </button>

      {open && (
        <div className="mt-3 space-y-3 pl-1 border-l-2 border-accent/20 ml-1">
          <GuideSection title="Setup" text={guide.setup} />
          <GuideSection title="Execution" text={guide.execution} />
          <GuideSection title="Common Mistakes" text={guide.mistakes} />
          <GuideSection title="Injury Watch" text={guide.injuryWatch} />
        </div>
      )}
    </div>
  )
}

function GuideSection({ title, text }) {
  return (
    <div className="pl-3">
      <h4 className="text-[11px] font-mono font-medium text-accent uppercase tracking-wider mb-1">
        {title}
      </h4>
      <p className="text-xs text-text/70 leading-relaxed">{text}</p>
    </div>
  )
}
