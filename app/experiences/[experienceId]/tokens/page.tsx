'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useIframeSdk } from '@whop/react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Rocket, Building2 } from 'lucide-react'

const TOKEN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    icon: Briefcase,
    tokens: 200,
    price: 10,
    description: 'Perfect for testing or generating your first 2 ads.',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    icon: Rocket,
    tokens: 600,
    price: 25,
    description: 'Best value for growing stores creating regular ads.',
    popular: true,
  },
  {
    id: 'agency',
    name: 'Agency Pack',
    icon: Building2,
    tokens: 1500,
    price: 55,
    description: 'Ideal for teams or agencies producing frequent UGC ads.',
    popular: false,
  },
]

export default function TokensPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const iframeSdk = useIframeSdk()
  const [tokenBalance, setTokenBalance] = useState(0)
  const [purchasing, setPurchasing] = useState(false)

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

  const handlePurchase = async (pkg: typeof TOKEN_PACKAGES[0]) => {
    setPurchasing(true)
    try {
      // Create charge on server
      const response = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          amount: pkg.price,
          tokens: pkg.tokens,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const result = await response.json()

      // Open Whop payment modal
      if (result.status === 'needs_action' && result.inAppPurchase) {
        const paymentResult = await iframeSdk.inAppPurchase(result.inAppPurchase)
        
        if (paymentResult.status === 'ok') {
          // Payment successful - refresh balance
          await fetchTokenBalance()
          alert(`Successfully added ${pkg.tokens} tokens to your account!`)
        } else {
          alert('Payment was cancelled or failed')
        }
      } else if (result.status === 'success') {
        // Payment completed immediately (shouldn't happen normally)
        await fetchTokenBalance()
        alert(`Successfully added ${pkg.tokens} tokens to your account!`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Buy Tokens</h1>
          <p className="text-lg text-muted-foreground">
            Your current balance: <span className="font-semibold text-foreground">{tokenBalance} tokens</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TOKEN_PACKAGES.map((pkg) => {
            const IconComponent = pkg.icon
            return (
              <Card
                key={pkg.id}
                className={`relative transition-all hover:shadow-lg ${
                  pkg.popular ? 'border-2 border-blue-600 shadow-md' : 'border border-border'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4 pt-8">
                  <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                  <div className="mb-3">
                    <span className="text-4xl font-bold text-foreground">${pkg.price}</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {pkg.tokens} tokens
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center min-h-[40px]">
                    {pkg.description}
                  </p>
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    className="w-full"
                    size="lg"
                    variant={pkg.popular ? 'default' : 'outline'}
                    disabled={purchasing}
                  >
                    {purchasing ? 'Processing...' : `Buy ${pkg.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-neutral-50 dark:from-blue-950/20 dark:to-neutral-900/20 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-xl">How Tokens Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/90">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              <p>Each 10s AI-powered UGC video costs 100 tokens.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              <p>Tokens never expire</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              <p>Videos are generated using advanced AI technology</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              <p>All videos can be downloaded in high quality</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
