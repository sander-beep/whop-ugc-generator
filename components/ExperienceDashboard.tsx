'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import type { Video, User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Coins, Video as VideoIcon, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

interface ExperienceDashboardProps {
  experienceId: string
  whopUserId: string
  whopUserName: string
  whopUsername: string
  experienceName: string
  accessLevel: string
}

export function ExperienceDashboard({
  experienceId,
  whopUserId,
  whopUserName,
  whopUsername,
  experienceName,
  accessLevel
}: ExperienceDashboardProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
    }
  }, [user, authLoading])

  const fetchData = async () => {
    if (!user) return

    try {
      // Fetch token balance from API
      const balanceResponse = await fetch('/api/tokens/balance')
      let tokenBalance = 0
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        tokenBalance = balanceData.tokenBalance
      }

      // Fetch videos from Supabase
      const { data: userVideos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setUserData({
        id: user.id,
        email: user.email || '',
        token_balance: tokenBalance,
        created_at: new Date().toISOString()
      })
      setVideos(userVideos || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
              <Coins className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{userData?.token_balance || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Available tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <VideoIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{videos.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Generated ads</p>
            </CardContent>
          </Card>

          <Card className="flex items-center justify-center">
            <CardContent className="pt-6">
              <Link href={`/experiences/${experienceId}/create`}>
                <Button size="lg" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Ad
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>Your latest generated UGC ads</CardDescription>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <VideoIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No videos yet</p>
                <Link href={`/experiences/${experienceId}/create`}>
                  <Button>Create Your First Ad</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <Link key={video.id} href={`/experiences/${experienceId}/video/${video.id}`}>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium mb-1 text-foreground">
                          {video.prompt_data.target_audience}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(video.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          video.status === 'completed'
                            ? 'default'
                            : video.status === 'processing'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {video.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

