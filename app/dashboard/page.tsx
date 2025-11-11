'use client'

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/use-fetch'
import { Filter, Link2, BarChart2, Star, Activity } from 'lucide-react'
import { getUrls } from "@/db/apiUrls"
import { BarLoader } from 'react-spinners'
import { getClicksForUrls } from "@/db/apiClicks"
import LinkCard from '@/components/ui/link-card'
import { CreateLink } from '@/components/create-link'
import { DebugUrls } from '@/components/debug-urls'

/**
 * Animated number component
 */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const end = value || 0
    if (end === 0) {
      setDisplay(0)
      return
    }
    
    let start = 0
    const duration = 800
    const increment = end / (duration / 16)
    let current = start
    
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(current))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

/**
 * Dashboard - Next.js App Router Version
 */
export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls) as any
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks
  } = useFetch(getClicksForUrls,
    (urls as any)?.map((url: any) => url.id)
  ) as any

  useEffect(() => {
    fnUrls()
  }, [fnUrls])

  useEffect(() => {
    if ((urls as any)?.length) fnClicks()
  }, [urls, fnClicks])

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  const filteredUrls = useMemo(() => {
    if (!urls) return []
    if (!searchQuery.trim()) return urls
    
    const searchLower = searchQuery.toLowerCase()
    return (urls as any[]).filter((url: any) => {
      const title = url.title || url.original_url || ''
      const shortUrl = url.short_url || ''
      const customUrl = url.custom_url || ''
      return (
        title.toLowerCase().includes(searchLower) ||
        shortUrl.toLowerCase().includes(searchLower) ||
        customUrl.toLowerCase().includes(searchLower)
      )
    })
  }, [urls, searchQuery])

  const stats = useMemo(() => {
    if (!urls) return { activeLinks: 0, mostClicked: null }
    
    const now = new Date()
    const activeLinks = (urls as any[]).filter((url: any) => {
      const created = new Date(url.created_at)
      const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 7
    }).length

    let mostClicked: any = null
    if (clicks) {
      const clickCounts = (urls as any[]).map((url: any) => ({
        ...url,
        clickCount: (clicks as any[]).filter((c: any) => c.url_id === url.id).length
      }))
      mostClicked = clickCounts.reduce(
        (max: any, curr: any) => curr.clickCount > (max?.clickCount || 0) ? curr : max, 
        null
      )
    }

    return { activeLinks, mostClicked }
  }, [urls, clicks])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#23232b] via-[#18181b] to-[#23232b] flex items-center justify-center py-8">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {(loading || loadingClicks) && <BarLoader width={"100%"} color='#91939f' />}
      
      <div className="mb-6">
        <DebugUrls />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="flex flex-row items-center gap-4 bg-[#f7f7f8] text-black shadow-md p-3 sm:p-4 w-full">
          <div className="p-3 rounded-full bg-blue-100">
            <Link2 className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold">Links Created</CardTitle>
            <CardContent className="p-0 text-2xl sm:text-3xl font-extrabold">
              <AnimatedNumber value={(urls as any)?.length || 0} />
            </CardContent>
          </div>
        </Card>
        <Card className="flex flex-row items-center gap-4 bg-[#f7f7f8] text-black shadow-md p-3 sm:p-4 w-full">
          <div className="p-3 rounded-full bg-green-100">
            <BarChart2 className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold">Total Clicks</CardTitle>
            <CardContent className="p-0 text-2xl sm:text-3xl font-extrabold">
              <AnimatedNumber value={(clicks as any)?.length || 0} />
            </CardContent>
          </div>
        </Card>
        <Card className="flex flex-row items-center gap-4 bg-[#f7f7f8] text-black shadow-md p-3 sm:p-4 w-full">
          <div className="p-3 rounded-full bg-yellow-100">
            <Activity className="h-7 w-7 text-yellow-600" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg font-bold">Active Links</CardTitle>
            <CardContent className="p-0 text-2xl sm:text-3xl font-extrabold">
              <AnimatedNumber value={stats.activeLinks} />
            </CardContent>
          </div>
        </Card>
        <Card className="flex flex-row items-center gap-4 bg-[#f7f7f8] text-black shadow-md p-3 sm:p-4 w-full">
          <div className="p-3 rounded-full bg-purple-100">
            <Star className="h-7 w-7 text-purple-600" />
          </div>
          <div className="truncate max-w-[120px]">
            <CardTitle className="text-base sm:text-lg font-bold">Most Clicked</CardTitle>
            <CardContent className="p-0 text-xs sm:text-base font-semibold truncate">
              {stats.mostClicked ? (
                <>
                  <span className="block truncate">{stats.mostClicked.title}</span>
                  <span className="block text-purple-700 text-lg">{stats.mostClicked.clickCount} clicks</span>
                </>
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 bg-[#18181b] py-2 px-2 sm:px-4 rounded-lg sticky top-2 z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold w-full sm:w-auto text-center sm:text-left">My Links</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Filter Links..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <CreateLink />
        </div>
      </div>

      <div>
        {error && <div className="text-red-500 text-center">{(error as any)?.message}</div>}
        {filteredUrls && filteredUrls.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <div className="text-2xl mb-2">No links found</div>
            <div className="mb-4">Try creating a new link or adjusting your filter.</div>
            <CreateLink />
          </div>
        )}
        <div className="mt-4">
          <div className="flex flex-col gap-6 w-full">
            {(filteredUrls || []).map((url: any, i: number) => (
              <LinkCard key={i} url={url} fetchUrls={fnUrls} />
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
