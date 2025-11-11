'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, ExternalLink, QrCode, BarChart } from 'lucide-react'
import useFetch from '@/hooks/use-fetch'
import { getUrl } from '@/db/apiUrls'
import { getClicksForUrl } from '@/db/apiClicks'
import { BarLoader } from 'react-spinners'
import DeviceStats from '@/components/device-stats'
import LocationStats from '@/components/location-stats'

export default function LinkDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const { loading, data: url, fn: fnUrl } = useFetch(getUrl, id) as any
  const { loading: loadingStats, data: stats, fn: fnStats } = useFetch(
    getClicksForUrl,
    id
  ) as any

  useEffect(() => {
    fnUrl()
  }, [id])

  useEffect(() => {
    if (url) fnStats()
  }, [url])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BarLoader width={'100%'} color='#91939f' />
      </div>
    )
  }

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Link Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This link doesn&apos;t exist or has been deleted.</p>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${url.custom_url || url.short_url}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
  }

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Link Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {url.title || 'Untitled Link'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Short URL */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Short URL</p>
            <div className="flex items-center gap-2">
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                {shortUrl}
                <ExternalLink className="h-4 w-4" />
              </a>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Original URL */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Original URL</p>
            <a 
              href={url.original_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline break-all flex items-center gap-1"
            >
              {url.original_url}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl font-bold">{url.clicks || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg">{new Date(url.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* QR Code */}
          {url.qr_code && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                QR Code
              </p>
              <img 
                src={url.qr_code} 
                alt="QR Code" 
                className="w-48 h-48 border rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics */}
      {loadingStats ? (
        <BarLoader width={'100%'} color='#91939f' />
      ) : stats && stats.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Analytics Dashboard
          </h2>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Unique Locations</p>
                  <p className="text-3xl font-bold text-green-500">
                    {new Set(stats.map(s => s.city)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Device Types</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {new Set(stats.map(s => s.device)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Countries</p>
                  <p className="text-3xl font-bold text-orange-500">
                    {new Set(stats.map(s => s.country)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-[#23232b] to-[#18181b]">
              <CardContent className="pt-6">
                <LocationStats stats={stats} />
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#23232b] to-[#18181b]">
              <CardContent className="pt-6">
                <DeviceStats stats={stats} />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Click Log */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Device</th>
                      <th className="text-left p-2">Browser</th>
                      <th className="text-left p-2">OS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.slice(0, 10).map((click, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">
                          {new Date(click.created_at).toLocaleString()}
                        </td>
                        <td className="p-2">
                          {click.city}, {click.country}
                        </td>
                        <td className="p-2 capitalize">{click.device}</td>
                        <td className="p-2">{click.browser}</td>
                        <td className="p-2">{click.os}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No analytics data yet</p>
            <p>Share your link to start tracking clicks and gathering insights!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
