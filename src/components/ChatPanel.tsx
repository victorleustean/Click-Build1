'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Suggestion = {
  title: string
  audience: string
  colors: string[]
  reasoning: string
}

type Config = {
  title: string
  audience: string
  colors: string[]
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  suggestion?: Suggestion
}

type Props = {
  className?: string
  onCodeGenerated: (code: string) => void
  onConfigAccepted: (config: Config) => void
  initialCode?: string
  initialConfig?: Config | null
}

function cleanJson(value: string) {
  return value
    .replace(/^\s*```json\s*/i, '')
    .replace(/^\s*```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

function cleanCode(value: string) {
  return value
    .replace(/^\s*```html\s*/i, '')
    .replace(/^\s*```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

function getPageName(value: string) {
  const match = value.trim().match(/^\/page\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

export default function ChatPanel({
  className = '',
  initialCode = '',
  initialConfig = null,
  onCodeGenerated,
  onConfigAccepted,
}: Props) {
  const hasLoadedProject = Boolean(initialCode && initialConfig)

const [messages, setMessages] = useState<Message[]>(
  hasLoadedProject
    ? [
        {
          role: 'assistant',
          content: `Am încărcat proiectul "${initialConfig?.title}". Spune-mi ce vrei să modific.`,
        },
      ]
    : [
        {
          role: 'assistant',
          content: 'Bună! Ce site vrei să construiești azi? Descrie-mi ideea.',
        },
      ]
)

const [input, setInput] = useState('')
const [loading, setLoading] = useState(false)
const [stage, setStage] = useState<'ask' | 'suggest' | 'build'>(
  hasLoadedProject ? 'build' : 'ask'
)
const [config, setConfig] = useState<Config | null>(initialConfig)
const [currentCode, setCurrentCode] = useState(initialCode)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    if (!input.trim() || loading) return

    const text = input.trim()
    const userMsg: Message = { role: 'user', content: text }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      if (stage === 'ask') {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'suggest',
            messages: [{ role: 'user', content: text }],
          }),
        })

        const data = await res.json()
        const suggestion: Suggestion = JSON.parse(cleanJson(data.content))

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Am analizat cererea ta. Iată recomandările mele:',
            suggestion,
          },
        ])

        setStage('suggest')
      } else if (stage === 'build') {
        const pageName = getPageName(text)

        if (pageName) {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'page',
              pageName,
              config,
              currentHtml: currentCode,
            }),
          })

          const data = await res.json()
          const code = cleanCode(data.content)

          setCurrentCode(code)
          onCodeGenerated(code)

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `Am construit pagina "${pageName}".`,
            },
          ])
        } else {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'edit',
              config,
              currentHtml: currentCode,
              messages: [{ role: 'user', content: text }],
            }),
          })

          const data = await res.json()
          const code = cleanCode(data.content)

          setCurrentCode(code)
          onCodeGenerated(code)

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Am actualizat site-ul. Ce mai modificăm?',
            },
          ])
        }
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'chat',
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        const data = await res.json()

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.content },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'A apărut o eroare. Încearcă din nou.',
        },
      ])
    }

    setLoading(false)
  }

  async function acceptSuggestion(suggestion: Suggestion) {
    if (loading) return

    const acceptedConfig = {
      title: suggestion.title,
      audience: suggestion.audience,
      colors: suggestion.colors,
    }

    setConfig(acceptedConfig)
    onConfigAccepted(acceptedConfig)

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Perfect! Construiesc "${suggestion.title}" acum...`,
      },
    ])

    setStage('build')
    setLoading(true)

    try {
      const buildMessage = `Construiește un site complet pentru "${suggestion.title}" destinat publicului "${suggestion.audience}".`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'build',
          config: acceptedConfig,
          messages: [{ role: 'user', content: buildMessage }],
        }),
      })

      const data = await res.json()
      const code = cleanCode(data.content)

      setCurrentCode(code)
      onCodeGenerated(code)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Site-ul e gata! Descrie ce vrei să modifici sau scrie /page NumePagina pentru o pagină nouă.',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Eroare la generare. Încearcă din nou.',
        },
      ])
    }

    setLoading(false)
  }

  function declineSuggestion() {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: 'Nicio problemă! Descrie-mi din nou ce vrei și voi ajusta.',
      },
    ])

    setStage('ask')
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="px-4 py-3 border-b flex items-center">
        <p className="text-xs text-muted-foreground">
          Visează. Vorbește. Construiește.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-pink-500 text-white rounded-br-sm'
                  : 'bg-muted rounded-bl-sm'
              }`}
            >
              {msg.content}

              {msg.suggestion && (
                <div className="mt-3 bg-background border rounded-xl p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Recomandări
                  </p>

                  <div className="space-y-1.5">
                    <Row label="Titlu" value={msg.suggestion.title} />
                    <Row label="Public" value={msg.suggestion.audience} />

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-14">
                        Culori
                      </span>

                      <div className="flex gap-1.5">
                        {msg.suggestion.colors.map((c, ci) => (
                          <div
                            key={ci}
                            className="w-5 h-5 rounded"
                            style={{ background: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground pt-1">
                      {msg.suggestion.reasoning}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 bg-pink-500 hover:bg-pink-600 h-8 text-xs"
                      onClick={() => acceptSuggestion(msg.suggestion!)}
                      disabled={loading}
                    >
                      Acceptă
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={declineSuggestion}
                      disabled={loading}
                    >
                      Refuză
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted-foreground">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Scrie un mesaj..."
          className="rounded-full text-sm"
          disabled={loading}
        />

        <Button
          onClick={send}
          size="icon"
          className="rounded-full shrink-0 bg-pink-500 hover:bg-pink-600"
          disabled={loading}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-14">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}
