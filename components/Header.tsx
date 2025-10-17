'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { Button } from './ui/button'
import { Coins, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { usePathname } from 'next/navigation'

export function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  // Extract experienceId from pathname if we're on an experience page
  const experienceMatch = pathname?.match(/^\/experiences\/([^\/]+)/)
  const experienceId = experienceMatch?.[1]
  const homeLink = experienceId ? `/experiences/${experienceId}` : '/'

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={homeLink} className="flex items-center gap-2 text-xl font-semibold">
          <Image 
            src="https://i.imgur.com/oRfIyIS.png" 
            alt="Logo" 
            width={28} 
            height={28}
            className="w-7 h-7"
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
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
