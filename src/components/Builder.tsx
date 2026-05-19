'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth, UserButton } from '@clerk/nextjs'
import ChatPanel from '@/components/ChatPanel'
import PreviewPanel from '@/components/PreviewPanel'
import Projects, { Project } from '@/components/Projects'
import { createClerkSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type Config = {
  title: string
  audience: string
  colors: string[]
}

export default function Builder() {
  const { getToken, userId } = useAuth()

  const [view, setView] = useState<'builder' | 'projects'>('builder')
  const [generatedCode, setGeneratedCode] = useState('')
  const [acceptedConfig, setAcceptedConfig] = useState<Config | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [chatKey, setChatKey] = useState(0)
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supabase = useMemo(() => {
    return createClerkSupabaseClient(getToken)
  }, [getToken])

  function openProject(project: Project) {
    setProjectId(project.id)
    setGeneratedCode(project.html)
    setAcceptedConfig({
      title: project.title,
      audience: project.audience || '',
      colors: project.colors,
    })
    setSaveStatus('saved')
    setView('builder')
    setChatKey((value) => value + 1)
  }

  function startNewProject() {
    setProjectId(null)
    setGeneratedCode('')
    setAcceptedConfig(null)
    setSaveStatus('idle')
    setView('builder')
    setChatKey((value) => value + 1)
  }

  useEffect(() => {
    if (!userId || !acceptedConfig || !generatedCode.trim()) return

    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }

    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')

      const project = {
        user_id: userId,
        title: acceptedConfig.title,
        audience: acceptedConfig.audience,
        colors: acceptedConfig.colors,
        html: generatedCode,
      }

      if (projectId) {
        const { error } = await supabase
          .from('projects')
          .update(project)
          .eq('id', projectId)
          .eq('user_id', userId)

        if (error) {
          console.error('[autosave update]', error)
          setSaveStatus('error')
          return
        }

        setSaveStatus('saved')
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select('id')
        .single()

      if (error) {
        console.error('[autosave insert]', error)
        setSaveStatus('error')
        return
      }

      setProjectId(data.id)
      setSaveStatus('saved')
    }, 800)

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
    }
  }, [acceptedConfig, generatedCode, projectId, supabase, userId])

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="h-11 border-b flex items-center justify-between px-4 shrink-0 bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="text-sm font-medium">Click && Build</span>
          </div>

          <span className="text-xs text-muted-foreground">
            {saveStatus === 'saving' && 'Se salvează...'}
            {saveStatus === 'saved' && 'Salvat automat'}
            {saveStatus === 'error' && 'Eroare la salvare'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={view === 'builder' ? 'default' : 'outline'}
            className={
              view === 'builder' ? 'bg-pink-500 hover:bg-pink-600' : ''
            }
            onClick={() => setView('builder')}
          >
            Acasă
          </Button>

          <Button
            size="sm"
            variant={view === 'projects' ? 'default' : 'outline'}
            className={
              view === 'projects' ? 'bg-pink-500 hover:bg-pink-600' : ''
            }
            onClick={() => setView('projects')}
          >
            Proiectele mele
          </Button>

          <UserButton />
        </div>
      </header>

      {view === 'projects' ? (
        <Projects
          className="flex-1"
          onOpenProject={openProject}
          onNewProject={startNewProject}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <ChatPanel
            key={chatKey}
            className="w-2/5 border-r"
            initialCode={generatedCode}
            initialConfig={acceptedConfig}
            onCodeGenerated={setGeneratedCode}
            onConfigAccepted={setAcceptedConfig}
          />

          <PreviewPanel
            className="w-3/5"
            code={generatedCode}
            config={acceptedConfig}
          />
        </div>
      )}
    </div>
  )
}