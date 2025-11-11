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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#23232b] via-[#18181b] to-[#23232b] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto">
        <section className="text-center space-y-8">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in leading-tight">
              <span>Make your links </span>
              <span className="gradient-text text-[#6f6f7c]">trimly</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mx-auto mb-8 animate-slide-up">
              Transform long, complex URLs into short, memorable links that are easy to share and track.
            </p>
          </div>
          
          <form onSubmit={handleShorten} className="w-full max-w-2xl mx-auto space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={longUrl}
                placeholder="Paste your long URL here..."
                onChange={(e) => setLongUrl(e.target.value)}
                className="pl-12 h-14 text-base w-full border-2 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-400 focus:border-[#6f6f7c] focus:ring-[#6f6f7c] rounded-lg"
              />
            </div>
            <Button 
              type="submit"
              className="h-14 w-full sm:w-auto sm:min-w-[200px] px-8 text-base font-semibold bg-gradient-to-r from-[#41414b] to-[#6f6f7c] hover:from-[#6f6f7c] hover:to-[#41414b] transition-all duration-300 rounded-lg"
            >
              Shorten URL
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}
