'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Config = {
  title: string
  audience: string
  colors: string[]
}

type Props = {
  className?: string
  code: string
  config: Config | null
}

function cleanCode(value = '') {
  return value
    .replace(/^\s*```html\s*/i, '')
    .replace(/^\s*```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

function getFileName(config: Config | null) {
  if (!config?.title) return 'site.html'

  const slug = config.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return `${slug || 'site'}.html`
}

export default function PreviewPanel({
  className = '',
  code,
  config,
}: Props) {
  const [activeTab, setActiveTab] = useState('Desktop')

  const preparedCode = cleanCode(code)
  const isMobile = activeTab === 'Mobile'

  function downloadHtml() {
    if (!preparedCode) return

    const blob = new Blob([preparedCode], {
      type: 'text/html;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = getFileName(config)
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className={`flex flex-col bg-muted/30 ${className}`}>
      <div className="px-4 py-3 border-b bg-background flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Previzualizare</p>

        <div className="flex items-center gap-2">
          {preparedCode && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-2 text-xs"
              onClick={downloadHtml}
            >
              <Download className="w-3.5 h-3.5" />
              HTML
            </Button>
          )}

          <div className="flex gap-1">
            {['Desktop', 'Mobile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-pink-500 text-white'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {preparedCode ? (
          <div
            className={`h-full w-full p-4 ${
              isMobile ? 'flex items-center justify-center' : ''
            }`}
          >
            <div
              className={
                isMobile
                  ? 'h-full max-h-[844px] w-[390px] max-w-full overflow-hidden rounded-[24px] border bg-white shadow-sm'
                  : 'h-full w-full overflow-hidden rounded-xl border bg-white shadow-sm'
              }
            >
              <iframe
                title="Website preview"
                srcDoc={preparedCode}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            {config ? (
              <div className="text-center space-y-2">
                <div className="flex gap-2 justify-center mb-4">
                  {config.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg"
                      style={{ background: c }}
                    />
                  ))}
                </div>

                <p className="font-medium">{config.title}</p>
                <p className="text-sm text-muted-foreground">
                  {config.audience}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Preview-ul complet apare când generezi codul
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>

                <p className="text-sm text-muted-foreground">
                  Preview-ul apare aici
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  după ce accepți recomandările
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}