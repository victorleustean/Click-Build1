'use client'

import { useAuth } from '@clerk/nextjs'
import Landing from './landing'
import Builder from '@/components/Builder'

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-muted-foreground">
        Se încarcă...
      </div>
    )
  }

  if (isSignedIn) {
    return <Builder />
  }

  return <Landing />
}