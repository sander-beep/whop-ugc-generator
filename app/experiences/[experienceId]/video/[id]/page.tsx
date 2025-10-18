'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase, type Video } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Video as VideoIcon, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function VideoPage({ params }: { params: Promise<{ experienceId: string, id: string }> }) {
  const { experienceId, id } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchVideo()
    }
  }, [user, authLoading, id])

  const fetchVideo = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    setVideo(data)
    setLoading(false)

    if (data && data.status === 'processing') {
      setTimeout(fetchVideo, 5000)
    }
  }

  const handleDownload = () => {
    if (video?.video_url) {
      window.open(video.video_url, '_blank')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || !video) return null

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Video Details</CardTitle>
                <CardDescription>Generated UGC Ad</CardDescription>
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
          </CardHeader>
          <CardContent className="space-y-6">
            {video.status === 'processing' && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6 text-center">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
                <h3 className="text-lg font-medium mb-2 text-foreground">Processing Your Video</h3>
                <p className="text-sm text-muted-foreground">
                  Your AI-generated UGC ad is being created. This usually takes 2-5 minutes.
                </p>
              </div>
            )}

            {video.status === 'completed' && video.video_url && (
              <div className="space-y-4">
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    src={video.video_url}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              </div>
            )}

            {video.status === 'failed' && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
                <VideoIcon className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-medium mb-2 text-foreground">Generation Failed</h3>
                <p className="text-sm text-muted-foreground">
                  Something went wrong while generating your video. Please try again.
                </p>
              </div>
            )}

            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-semibold text-foreground">Generation Details</h3>
              <div className="grid gap-4 text-sm">
                {video.prompt_data.product_description && (
                  <div>
                    <span className="text-muted-foreground">Product Description:</span>
                    <div className="font-medium text-foreground">{video.prompt_data.product_description}</div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Target Audience:</span>
                  <div className="font-medium text-foreground">{video.prompt_data.target_audience}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">UGC Character:</span>
                  <div className="font-medium text-foreground">{video.prompt_data.ugc_character}</div>
                </div>
                {video.prompt_data.platform && (
                  <div>
                    <span className="text-muted-foreground">Platform:</span>
                    <div className="font-medium text-foreground">{video.prompt_data.platform}</div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Aspect Ratio:</span>
                  <div className="font-medium text-foreground">{video.prompt_data.aspect_ratio}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Segments:</span>
                  <div className="space-y-2 mt-2">
                    {video.prompt_data.segments?.map((segment, index) => (
                      <div key={index} className="bg-accent/30 p-3 rounded border border-border">
                        <div className="font-medium text-xs text-muted-foreground mb-1">
                          Segment {index + 1}
                        </div>
                        <div className="text-sm mb-2 text-foreground">
                          <span className="text-muted-foreground">Dialogue: </span>
                          {segment.dialogue}
                        </div>
                        <div className="text-sm text-foreground">
                          <span className="text-muted-foreground">Visual Description: </span>
                          {segment.visualDescription}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/experiences/${experienceId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href={`/experiences/${experienceId}/create`} className="flex-1">
                <Button className="w-full">
                  Generate Another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
