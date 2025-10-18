'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { Button } from './ui/button'
import { Coins, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Extract experienceId from pathname if we're on an experience page
  const experienceMatch = pathname?.match(/^\/experiences\/([^\/]+)/)
  const experienceId = experienceMatch?.[1]
  const homeLink = experienceId ? `/experiences/${experienceId}` : '/'

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    // Check initially
    checkDarkMode()
    
    // Watch for changes to the dark class
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  const logoUrl = isDarkMode 
    ? 'https://i.imgur.com/ahF6QPr.png' 
    : 'https://i.imgur.com/oRfIyIS.png'

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={homeLink} className="flex items-center gap-2 text-xl font-semibold">
          <Image 
            src={logoUrl}
            alt="Logo" 
            width={28} 
            height={28}
            className="w-7 h-7"
            key={logoUrl}
          />
          <span>UGC Ad Generator</span>
        </Link>
        {user && (
          <nav className="flex items-center gap-4">
            <Link href={experienceId ? `/experiences/${experienceId}/tokens` : '/tokens'}>
              <Button variant="outline" size="sm">
                <Coins className="w-4 h-4 mr-2" />
                Tokens
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profilePictureUrl || undefined} alt={user.name} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{user.name}</span>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
