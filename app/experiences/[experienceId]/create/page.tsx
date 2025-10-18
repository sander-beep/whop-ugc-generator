'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Trash2, Upload, AlertCircle } from 'lucide-react'

type Segment = {
  dialogue: string
  visualDescription: string
}

export default function CreatePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const experienceId = params.experienceId as string
  const [productDescription, setProductDescription] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [ugcCharacter, setUgcCharacter] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [segments, setSegments] = useState<Segment[]>([{ dialogue: '', visualDescription: '' }])
  const [productImage, setProductImage] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [tokenBalance, setTokenBalance] = useState(0)

  useEffect(() => {
    if (!authLoading && user) {
      fetchTokenBalance()
    }
  }, [user, authLoading])

  const fetchTokenBalance = async () => {
    if (!user) return
    try {
      const response = await fetch('/api/tokens/balance')
      if (response.ok) {
        const data = await response.json()
        setTokenBalance(data.tokenBalance)
      }
    } catch (error) {
      console.error('Error fetching token balance:', error)
    }
  }

  const addSegment = () => {
    if (segments.length < 4) {
      setSegments([...segments, { dialogue: '', visualDescription: '' }])
    }
  }

  const removeSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index))
    }
  }

  const updateSegment = (index: number, field: 'dialogue' | 'visualDescription', value: string) => {
    const newSegments = [...segments]
    newSegments[index][field] = value
    setSegments(newSegments)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setProductImage(null)
      setImageError('')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setImageError('Please upload a JPEG, PNG, or WebP image')
      setProductImage(null)
      e.target.value = '' // Reset the input
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      setImageError('Image must be less than 10MB')
      setProductImage(null)
      e.target.value = '' // Reset the input
      return
    }

    setImageError('')
    setProductImage(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const totalCost = 100 // Always 100 tokens per video
    if (tokenBalance < totalCost) {
      alert(`Insufficient tokens. You need ${totalCost} tokens to generate this video.`)
      router.push(`/experiences/${experienceId}/tokens`)
      return
    }

    setLoading(true)

    try {
      let productImageUrl = ''

      if (productImage && user) {
        const fileExt = productImage.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, productImage)

        if (!uploadError) {
          const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)
          productImageUrl = data.publicUrl
        }
      }

      // Create video using API endpoint (handles token deduction)
      const response = await fetch('/api/videos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptData: {
            product_image_url: productImageUrl,
            product_description: productDescription,
            target_audience: targetAudience,
            ugc_character: ugcCharacter,
            platform: platform,
            aspect_ratio: aspectRatio,
            segments: segments,
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create video')
      }

      const { video } = await response.json()
      
      // Refresh token balance
      await fetchTokenBalance()

      router.push(`/experiences/${experienceId}/video/${video.id}`)
    } catch (error) {
      console.error(error)
      
      // Check if error is due to insufficient tokens
      const errorMessage = error instanceof Error ? error.message : 'Failed to create video'
      if (errorMessage.includes('Insufficient token balance')) {
        alert('Insufficient tokens. Please purchase more tokens.')
        router.push(`/experiences/${experienceId}/tokens`)
      } else {
        alert('Failed to create video')
      }
      
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create UGC Ad</CardTitle>
            <CardDescription>Fill in the details to generate your AI-powered UGC video</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product-image">Product Image</Label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors ${imageError ? 'border-red-500 bg-red-950/10' : 'border-border'}`}>
                  <input
                    type="file"
                    id="product-image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="product-image" className="cursor-pointer">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${imageError ? 'text-red-400' : 'text-muted-foreground'}`} />
                    <div className="text-sm text-foreground">
                      {productImage ? productImage.name : 'Click to upload product image'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Supports JPEG, PNG, WebP (max 10MB)
                    </div>
                  </label>
                </div>
                {imageError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Product Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="Describe your product in detail..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-audience">Target Audience</Label>
                <Input
                  id="target-audience"
                  placeholder="e.g., Fitness enthusiasts, Tech-savvy millennials"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ugc-character">Preferred UGC Character</Label>
                <Input
                  id="ugc-character"
                  placeholder="e.g., Young professional, Athlete"
                  value={ugcCharacter}
                  onChange={(e) => setUgcCharacter(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                    <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Segments ({segments.length}/4)</Label>
                    <p className="text-xs text-muted-foreground mt-1">Total video: 10 seconds • 100 tokens</p>
                  </div>
                  {segments.length < 4 && (
                    <Button type="button" variant="outline" size="sm" onClick={addSegment}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Segment
                    </Button>
                  )}
                </div>

                {segments.map((segment, index) => {
                  const segmentDuration = (10 / segments.length).toFixed(1);
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-medium text-foreground">Segment {index + 1}</span>
                            <span className="text-xs text-muted-foreground ml-2">({segmentDuration}s)</span>
                          </div>
                          {segments.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSegment(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          placeholder="Dialogue for this segment..."
                          value={segment.dialogue}
                          onChange={(e) => updateSegment(index, 'dialogue', e.target.value)}
                          rows={3}
                          required
                        />
                        <Textarea
                          placeholder="Visual description for this segment..."
                          value={segment.visualDescription}
                          onChange={(e) => updateSegment(index, 'visualDescription', e.target.value)}
                          rows={3}
                          required
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm">
                  <div className="text-muted-foreground">
                    Total Cost: <span className="font-semibold text-foreground">100 tokens</span>
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    Your Balance: <span className={`font-semibold ${tokenBalance < 100 ? 'text-red-600' : 'text-foreground'}`}>{tokenBalance} tokens</span>
                  </div>
                  {tokenBalance < 100 && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/experiences/${experienceId}/tokens`)}
                        className="text-xs"
                      >
                        Buy More Tokens
                      </Button>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading || tokenBalance < 100}>
                  {loading ? 'Generating...' : 'Generate Video'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
