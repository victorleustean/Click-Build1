import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CHAT_MODEL = 'gpt-5-mini'
const BUILD_MODEL = 'gpt-5-codex'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const designSystemsDir = path.join(process.cwd(), 'design-systems')
const designSystems = fs.existsSync(designSystemsDir)
  ? fs
      .readdirSync(designSystemsDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({
        name: f.replace(/\.md$/i, ''),
        content: fs.readFileSync(path.join(designSystemsDir, f), 'utf-8'),
      }))
  : []

const designSystemsContext = designSystems
  .map((ds) => `=== DESIGN SYSTEM: ${ds.name.toUpperCase()} ===\n${ds.content}`)
  .join('\n\n')

const suggestionResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'site_suggestion',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string' },
        audience: { type: 'string' },
        colors: { type: 'array', items: { type: 'string' } },
        reasoning: { type: 'string' },
      },
      required: ['title', 'audience', 'colors', 'reasoning'],
    },
  },
}

const imageQueriesResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'image_queries',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        queries: { type: 'array', items: { type: 'string' } },
      },
      required: ['queries'],
    },
  },
}

function cleanFence(value: string) {
  return value
    .replace(/^\s*```json\s*/i, '')
    .replace(/^\s*```html\s*/i, '')
    .replace(/^\s*```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
}

function parseJson<T>(value: string): T {
  return JSON.parse(cleanFence(value)) as T
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((message) => {
    if (!message || typeof message !== 'object') return []

    const candidate = message as Partial<ChatMessage>
    if (
      (candidate.role !== 'user' && candidate.role !== 'assistant') ||
      typeof candidate.content !== 'string'
    ) {
      return []
    }

    return [{ role: candidate.role, content: candidate.content }]
  })
}

function getLastUserMessage(messages: ChatMessage[]) {
  return messages.filter((m) => m.role === 'user').at(-1)?.content || ''
}

function responseText(response: any) {
  if (typeof response.output_text === 'string') return response.output_text

  return (response.output || [])
    .flatMap((item: any) => item.content || [])
    .map((part: any) => (typeof part.text === 'string' ? part.text : ''))
    .join('')
}

async function runMiniChat({
  instructions,
  messages,
  maxCompletionTokens = 1000,
  responseFormat,
}: {
  instructions: string
  messages: ChatMessage[]
  maxCompletionTokens?: number
  responseFormat?: any
}) {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    reasoning_effort: 'low',
    max_completion_tokens: maxCompletionTokens,
    messages: [{ role: 'developer', content: instructions }, ...messages],
    ...(responseFormat ? { response_format: responseFormat } : {}),
  })

  return response.choices[0]?.message?.content || ''
}

async function runCodexBuild({
  instructions,
  messages,
  maxOutputTokens = 12000,
}: {
  instructions: string
  messages: ChatMessage[]
  maxOutputTokens?: number
}) {
  const input = messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))

  const response = await openai.responses.create({
    model: BUILD_MODEL,
    instructions,
    input,
    reasoning: { effort: 'medium' },
    max_output_tokens: maxOutputTokens,
  })

  return responseText(response)
}

async function fetchUnsplashImages(
  queries: string[]
): Promise<Record<string, string>> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  const results: Record<string, string> = {}

  if (!accessKey) return results

  const uniqueQueries = Array.from(
    new Set(queries.map((q) => q.trim()).filter(Boolean))
  ).slice(0, 5)

  await Promise.all(
    uniqueQueries.map(async (query) => {
      try {
        const res = await fetch(
          `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
            query
          )}&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${accessKey}`,
            },
          }
        )

        const data = await res.json()
        if (data?.urls?.regular) results[query] = data.urls.regular
      } catch {
        // optional images, so generation should continue without them
      }
    })
  )

  return results
}

async function getImageQueries(description: string, config: any) {
  const content = await runMiniChat({
    instructions:
      'Raspunde DOAR cu JSON valid. Genereaza maximum 5 queries specifice pentru Unsplash.',
    messages: [
      {
        role: 'user',
        content: `Ce imagini ar trebui sa folosesc pentru un site cu titlul "${config?.title}" pentru "${config?.audience}"? Descrierea: ${description}`,
      },
    ],
    maxCompletionTokens: 800,
    responseFormat: imageQueriesResponseFormat,
  })

  try {
    const parsed = parseJson<{ queries: string[] }>(content)
    return Array.isArray(parsed.queries) ? parsed.queries.slice(0, 5) : []
  } catch {
    return []
  }
}

function colorRule(config: any) {
  const colors = Array.isArray(config?.colors) ? config.colors : []

  return `
CULORI - PRIORITATE ABSOLUTA:
Foloseste OBLIGATORIU aceste culori; au prioritate fata de orice design system:
- Accent principal: ${colors[0] || '#ec4899'}
- Accent secundar: ${colors[1] || '#8b5cf6'}
- Background/text: ${colors[2] || '#111827'}
Nu folosi culorile din design systems; ele sunt doar pentru principii de layout si tipografie.
`
}

function codeRules() {
  return `
REGULI STRICTE DE COD:
- Raspunde DOAR cu HTML valid, fara explicatii, fara markdown, fara backticks
- Tot CSS intr-un singur <style> in <head>
- Tot JS intr-un singur <script> inainte de </body>
- Importa fonturile din Google Fonts
- Mobile-first cu media queries la 768px si 1024px
- Animatii CSS subtile: fadeInUp, hover transitions pe carduri si butoane
- Fara Lorem Ipsum; text realist si relevant
- Comenteaza fiecare sectiune cu <!-- SECTION NAME -->
`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = normalizeMessages(body.messages)
    const { mode, config, currentHtml = '', pageName = '' } = body

    if (mode === 'suggest') {
      const content = await runMiniChat({
        instructions: `Esti un expert in web design. Utilizatorul descrie un site. Raspunde DOAR cu JSON valid cu structura:
{
  "title": "...",
  "audience": "...",
  "colors": ["#hex1", "#hex2", "#hex3"],
  "reasoning": "..."
}`,
        messages,
        maxCompletionTokens: 1000,
        responseFormat: suggestionResponseFormat,
      })

      return NextResponse.json({ content })
    }

    if (mode === 'build') {
      const lastUserMessage = getLastUserMessage(messages)
      const imageQueries = await getImageQueries(lastUserMessage, config)
      const images = await fetchUnsplashImages(imageQueries)

      const imageContext =
        Object.entries(images).length > 0
          ? `\nIMAGINI DISPONIBILE (foloseste aceste URL-uri exact in <img src="">):\n${Object.entries(
              images
            )
              .map(([q, url]) => `- "${q}": ${url}`)
              .join('\n')}`
          : ''

      const content = await runCodexBuild({
        instructions: `Esti un expert web developer. Genereaza un site HTML complet intr-un singur fisier.

CONFIGURATIA SITE-ULUI:
- Titlu: ${config?.title}
- Public tinta: ${config?.audience}

${colorRule(config)}

DESIGN SYSTEMS DISPONIBILE:
${designSystemsContext || 'Nu exista design systems incarcate.'}

${imageContext}

${codeRules()}

Include obligatoriu: navbar sticky, hero fullscreen, features cu 3+ carduri, about, CTA, footer.`,
        messages,
      })

      return NextResponse.json({ content })
    }

    if (mode === 'edit') {
      const lastUserMessage = getLastUserMessage(messages)
      let imageContext = ''

      const needsImages =
        /imagine|imagini|foto|background|hero|banner|picture|photo|image/i.test(
          lastUserMessage
        )

      if (needsImages) {
        const imageQueries = await getImageQueries(lastUserMessage, config)
        const images = await fetchUnsplashImages(imageQueries)

        if (Object.entries(images).length > 0) {
          imageContext = `\nIMAGINI NOI DISPONIBILE:\n${Object.entries(images)
            .map(([q, url]) => `- "${q}": ${url}`)
            .join('\n')}`
        }
      }

      const content = await runCodexBuild({
        instructions: `Esti un expert web developer. Primesti un site HTML existent si instructiuni de modificare.

SITE-UL CURENT:
${currentHtml}

CONFIGURATIA:
- Titlu: ${config?.title}

${colorRule(config)}
${imageContext}

REGULI:
- Aplica EXACT modificarile cerute si nu schimba nimic altceva
- Pastreaza toate sectiunile, animatiile si structura existenta
- Raspunde DOAR cu HTML-ul complet modificat, fara explicatii, fara markdown
- Daca userul cere o culoare specifica, aplic-o exact`,
        messages: [{ role: 'user', content: lastUserMessage }],
      })

      return NextResponse.json({ content })
    }

    if (mode === 'page') {
      const imageQueries = await getImageQueries(
        `${pageName} page for ${config?.title}`,
        config
      )
      const images = await fetchUnsplashImages(imageQueries)

      const imageContext =
        Object.entries(images).length > 0
          ? `\nIMAGINI DISPONIBILE:\n${Object.entries(images)
              .map(([q, url]) => `- "${q}": ${url}`)
              .join('\n')}`
          : ''

      const content = await runCodexBuild({
        instructions: `Esti un expert web developer. Construiesti pagina "${pageName}" pentru site-ul "${config?.title}".

SITE-UL PRINCIPAL:
${currentHtml}

Copiaza EXACT navbar-ul, footer-ul, fonturile, culorile si stilul de componente.

CONFIGURATIA:
- Titlu site: ${config?.title}
- Public tinta: ${config?.audience}

${colorRule(config)}
${imageContext}
${codeRules()}

Navbar si footer IDENTICE cu site-ul principal. Continut relevant si complet pentru pagina "${pageName}".`,
        messages: [{ role: 'user', content: `Construieste pagina ${pageName}` }],
      })

      return NextResponse.json({ content })
    }

    const content = await runMiniChat({
      instructions:
        'Esti un asistent web builder. Ajuti utilizatorul sa construiasca site-uri web. Fii concis si prietenos. Raspunde in romana.',
      messages,
      maxCompletionTokens: 700,
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('[api/chat]', error)
    return NextResponse.json(
      { error: 'OpenAI request failed' },
      { status: 500 }
    )
  }
}
