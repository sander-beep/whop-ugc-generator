'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="https://i.imgur.com/oRfIyIS.png" 
              alt="Logo" 
              width={64} 
              height={64}
              className="w-16 h-16"
            />
          </div>
          <CardTitle className="text-2xl">Sora 2 Ad Generator</CardTitle>
          <CardDescription>
            AI-Powered Video Ad Creation
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              Please open "Sora 2 Ad Generator" in Whop to use this application.
            </p>
            <p className="text-xs text-muted-foreground/80">
              This app must be accessed through your Whop dashboard to authenticate and access your experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
