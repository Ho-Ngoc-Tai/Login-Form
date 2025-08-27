'use client'

import { mockAuth } from '@/app/mock/mockAuth'
import { useAppContext } from '@/app/app-provider'
import { Button } from '@/app/components/ui/button'
import { handleErrorApi } from '@/app/lib/utils'
import { usePathname, useRouter } from 'next/navigation'

export default function ButtonLogout() {
  const { setUser } = useAppContext()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await mockAuth.logout() // dùng mockAuth
      setUser(null)
      router.push('/login')
    } catch (error) {
      handleErrorApi({ error })
      // fallback: vẫn logout và redirect
      setUser(null)
      router.push(`/login?redirectFrom=${pathname}`)
    } finally {
      router.refresh()
      localStorage.removeItem('tokens')
      localStorage.removeItem('user')
    }
  }

  return (
    <Button size="sm" onClick={handleLogout}>
      Đăng xuất
    </Button>
  )
}
