'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LinkIcon } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Landing Page - Next.js App Router Version
 */
export default function LandingPage() {
  const [longUrl, setLongUrl] = useState('')
  const router = useRouter()
  
  const handleShorten = (e) => {
    e.preventDefault()
    if (longUrl) router.push('/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#23232b] via-[#18181b] to-[#23232b] flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <section className="w-full text-center py-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in leading-tight">
            <span>Make your links </span>
            <span className="gradient-text text-[#6f6f7c]">trimly</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up">
            Transform long, complex URLs into short, memorable links that are easy to share and track.
          </p>
          <form onSubmit={handleShorten} className="flex flex-col md:flex-row items-center justify-center gap-3 max-w-2xl mx-auto w-full">
            <div className="relative w-full md:w-2/3">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-trimly-500" />
              </div>
              <Input
                type="text"
                value={longUrl}
                placeholder="Paste your long URL here..."
                onChange={(e) => setLongUrl(e.target.value)}
                className="pl-10 h-12 border-2 border-trimly-100 focus:border-trimly-400 focus:ring-trimly-400 text-base w-full"
              />
            </div>
            <Button variant="default" size="default" className="h-12 w-full md:w-auto px-8 text-base font-semibold bg-gradient-to-r from-[#41414b] to-[#6f6f7c] hover:from-[#6f6f7c] hover:to-[#41414b] transition">
              Shorten URL
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}
