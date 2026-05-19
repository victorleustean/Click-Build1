'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { createClerkSupabaseClient } from '@/lib/supabase'

export type Project = {
  id: string
  user_id: string
  title: string
  audience: string | null
  colors: string[]
  html: string
  created_at: string
  updated_at: string
}

type Props = {
  className?: string
  onOpenProject: (project: Project) => void
  onNewProject: () => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function Projects({
  className = '',
  onOpenProject,
  onNewProject,
}: Props) {
  const { getToken, userId } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = useMemo(() => {
    return createClerkSupabaseClient(getToken)
  }, [getToken])

  useEffect(() => {
    async function loadProjects() {
      if (!userId) return

      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('projects')
        .select('id, user_id, title, audience, colors, html, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('[projects load]', error)
        setError('Nu am putut încărca proiectele.')
        setLoading(false)
        return
      }

      setProjects(
        (data || []).map((project: any) => ({
          ...project,
          colors: Array.isArray(project.colors) ? project.colors : [],
        }))
      )

      setLoading(false)
    }

    loadProjects()
  }, [supabase, userId])

  return (
    <div className={`h-full overflow-y-auto bg-background p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Proiectele mele</h1>
          <p className="text-sm text-muted-foreground">
            Continuă editarea unui site început anterior.
          </p>
        </div>

        <Button
          onClick={onNewProject}
          className="bg-pink-500 hover:bg-pink-600"
        >
          Proiect nou
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Se încarcă...</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm font-medium">Nu ai proiecte salvate încă.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Generează primul site, iar autosave-ul îl va salva aici.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onOpenProject(project)}
            className="text-left rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{project.title}</p>

                {project.audience && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.audience}
                  </p>
                )}

                <p className="mt-3 text-xs text-muted-foreground">
                  Creat: {formatDate(project.created_at)}
                </p>

                <p className="text-xs text-muted-foreground">
                  Actualizat: {formatDate(project.updated_at)}
                </p>
              </div>

              <div className="flex gap-1.5">
                {project.colors.slice(0, 3).map((color, index) => (
                  <span
                    key={`${project.id}-${index}`}
                    className="h-5 w-5 rounded border"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}