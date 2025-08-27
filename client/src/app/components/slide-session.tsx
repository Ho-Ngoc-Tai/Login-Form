'use client'

import { useEffect } from 'react'
import { differenceInHours } from 'date-fns'
import { mockAuth } from '@/app/mock/mockAuth'

export default function SlideSession() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date()
      const tokensStr = localStorage.getItem('tokens')
      if (!tokensStr) return

      const tokens = JSON.parse(tokensStr)
      const expiresAt = new Date(tokens.accessTokenExpiresAt)

      if (differenceInHours(expiresAt, now) < 1) {
        // refresh token
        const refreshResult = await mockAuth.refreshToken()
        if (refreshResult.success) {
          tokens.accessToken = refreshResult.data.accessToken
          tokens.accessTokenExpiresAt = refreshResult.data.accessTokenExpiresAt
          localStorage.setItem('tokens', JSON.stringify(tokens))
        } else {
          // refresh thất bại → logout
          localStorage.removeItem('tokens')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    }, 1000 * 60 * 30) // 30 phút

    return () => clearInterval(interval)
  }, [])

  return null
}
