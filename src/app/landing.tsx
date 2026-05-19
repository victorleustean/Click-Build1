'use client'

import Grainient from '@/components/Grainient'
import TextType from '@/components/TextType'
import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'

export default function Landing() {
  return (
    <div className="relative h-screen overflow-hidden">
      <Grainient
        color1="#ed64a6"
        color2="#FFFFFF"
        color3="#F06292"
        timeSpeed={0.25}
        colorBalance={0}
        warpStrength={0.7}
        warpFrequency={5}
        warpSpeed={2}
        warpAmplitude={50}
        blendAngle={0}
        blendSoftness={0.05}
        rotationAmount={500}
        noiseScale={0.85}
        grainAmount={0.1}
        grainScale={2}
        grainAnimated={false}
        contrast={1.5}
        gamma={1}
        saturation={1}
        centerX={0}
        centerY={0}
        zoom={1.05}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-6">
          <div className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-neutral-950">
            <TextType
              text={['Bine ai venit pe Click && Build!']}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor
              cursorCharacter="_"
              deletingSpeed={50}
            />
          </div>

          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-neutral-700">
            Construiește site-uri complete doar prin conversație, vezi rezultatul
            instant și exportă proiectul când este gata.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <SignInButton
              mode="modal"
              forceRedirectUrl="/"
              fallbackRedirectUrl="/"
            >
              <Button className="rounded-full bg-pink-500 px-6 hover:bg-pink-600">
                Autentificare
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  )
}