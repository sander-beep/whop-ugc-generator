'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

type Scene = {
  description: string
  script: string
}

export default function CreatePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [targetAudience, setTargetAudience] = useState('')
  const [ugcCharacter, setUgcCharacter] = useState('')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [scenes, setScenes] = useState<Scene[]>([{ description: '', script: '' }])
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

  const addScene = () => {
    if (scenes.length < 4) {
      setScenes([...scenes, { description: '', script: '' }])
    }
  }

  const removeScene = (index: number) => {
    if (scenes.length > 1) {
      setScenes(scenes.filter((_, i) => i !== index))
    }
  }

  const updateScene = (index: number, field: 'description' | 'script', value: string) => {
    const newScenes = [...scenes]
    newScenes[index][field] = value
    setScenes(newScenes)
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

    const totalCost = scenes.length * 100
    if (tokenBalance < totalCost) {
      alert(`Insufficient tokens. You need ${totalCost} tokens to generate this video (${scenes.length} scenes × 100 tokens).`)
      router.push('/tokens')
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
            target_audience: targetAudience,
            ugc_character: ugcCharacter,
            aspect_ratio: aspectRatio,
            scenes,
            product_image_url: productImageUrl,
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create video')
      }

      const { video } = await response.json()
      
      // Refresh token balance
      await fetchTokenBalance()

      router.push(`/video/${video.id}`)
    } catch (error) {
      console.error(error)
      
      // Check if error is due to insufficient tokens
      const errorMessage = error instanceof Error ? error.message : 'Failed to create video'
      if (errorMessage.includes('Insufficient token balance')) {
        alert('Insufficient tokens. Please purchase more tokens.')
        router.push('/tokens')
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
    <div className="min-h-screen bg-neutral-50 py-8">
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
                <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-neutral-400 transition-colors ${imageError ? 'border-red-300 bg-red-50' : ''}`}>
                  <input
                    type="file"
                    id="product-image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="product-image" className="cursor-pointer">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${imageError ? 'text-red-400' : 'text-neutral-400'}`} />
                    <div className="text-sm text-neutral-600">
                      {productImage ? productImage.name : 'Click to upload product image'}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
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
                    <Label>Scenes ({scenes.length}/4)</Label>
                    <p className="text-xs text-neutral-500 mt-1">Each scene is 10 seconds long and costs 100 tokens</p>
                  </div>
                  {scenes.length < 4 && (
                    <Button type="button" variant="outline" size="sm" onClick={addScene}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Scene
                    </Button>
                  )}
                </div>

                {scenes.map((scene, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium">Scene {index + 1}</span>
                          <span className="text-xs text-neutral-500 ml-2">(10s • 100 tokens)</span>
                        </div>
                        {scenes.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeScene(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        placeholder="Describe the scene..."
                        value={scene.description}
                        onChange={(e) => updateScene(index, 'description', e.target.value)}
                        rows={3}
                        required
                      />
                      <Textarea
                        placeholder="Scene script..."
                        value={scene.script}
                        onChange={(e) => updateScene(index, 'script', e.target.value)}
                        rows={3}
                        required
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm">
                  <div className="text-neutral-600">
                    Total Cost: <span className="font-semibold text-neutral-900">{scenes.length} × 100 = {scenes.length * 100} tokens</span>
                  </div>
                  <div className="text-neutral-500 text-xs mt-1">
                    Your Balance: <span className="font-semibold">{tokenBalance} tokens</span>
                  </div>
                </div>
                <Button type="submit" disabled={loading || tokenBalance < scenes.length * 100}>
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
