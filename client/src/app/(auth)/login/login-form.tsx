'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { mockAuth } from '@/app/mock/mockAuth'
import { toast } from '@/app/components/ui/use-toast'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import Cookies from 'js-cookie'


interface LoginFormInputs {
  email: string
  password: string
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormInputs>()

  const [serverError, setServerError] = useState<string | null>(null)
  const [debugOpen, setDebugOpen] = useState(true)
  const [debugMessage, setDebugMessage] = useState<string>('')
  const [tokensView, setTokensView] = useState({
    accessToken: '',
    refreshToken: '',
    accessTokenExpiresAt: '',
    refreshTokenExpiresAt: ''
  })

  const readCookies = () => {
    setTokensView({
      accessToken: Cookies.get('accessToken') || '',
      refreshToken: Cookies.get('refreshToken') || '',
      accessTokenExpiresAt: Cookies.get('accessTokenExpiresAt') || '',
      refreshTokenExpiresAt: Cookies.get('refreshTokenExpiresAt') || ''
    })
  }

  useEffect(() => {
    readCookies()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      readCookies()
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null)
    try {
      const response = await mockAuth.login(data)

      if (response.success) {
        toast({
          title: 'Đăng nhập thành công',
          description: `Xin chào, ${response.data.account.name}`
        })
        // Redirect tới dashboard sau khi đăng nhập thành công
        window.location.href = '/register'
      } else {
        setServerError(response.message)
      }
    } catch (error: any) {
      setServerError('Đã có lỗi xảy ra, vui lòng thử lại')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register('email', { required: 'Email không được để trống' })}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>
      <div>
        <Input
          type="password"
          placeholder="Mật khẩu"
          {...register('password', { required: 'Mật khẩu không được để trống' })}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>

      <div className="mt-6 border rounded-md p-3">
        <div className="flex items-center justify-between">
          <p className="font-medium">Debug Token (Demo)</p>
          <Button type="button" variant="secondary" onClick={() => setDebugOpen((v) => !v)}>
            {debugOpen ? 'Ẩn' : 'Hiện'}
          </Button>
        </div>
        {debugOpen && (
          <div className="mt-3 space-y-3">
            <div className="text-sm break-all">
              <p><span className="font-semibold">accessToken:</span> {tokensView.accessToken || '(trống)'}</p>
              <p><span className="font-semibold">refreshToken:</span> {tokensView.refreshToken || '(trống)'}</p>
              <p><span className="font-semibold">accessTokenExpiresAt:</span> {tokensView.accessTokenExpiresAt || '(trống)'}{tokensView.accessTokenExpiresAt && ` (${new Date(Number(tokensView.accessTokenExpiresAt)).toLocaleTimeString()})`}</p>
              <p><span className="font-semibold">refreshTokenExpiresAt:</span> {tokensView.refreshTokenExpiresAt || '(trống)'}{tokensView.refreshTokenExpiresAt && ` (${new Date(Number(tokensView.refreshTokenExpiresAt)).toLocaleTimeString()})`}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => { readCookies(); setDebugMessage('Đã tải lại cookie') }}>
                Tải lại cookie
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const res = await mockAuth.getProfile()
                  if ((res as any).success) setDebugMessage('getProfile: Thành công')
                  else setDebugMessage(`getProfile: ${ (res as any).status } - ${ (res as any).message }`)
                  readCookies()
                }}
              >
                Gọi getProfile
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const res = await mockAuth.refreshToken()
                  if ((res as any).success) setDebugMessage('refreshToken: Thành công (accessToken mới)')
                  else setDebugMessage(`refreshToken: ${ (res as any).status } - ${ (res as any).message }`)
                  readCookies()
                }}
              >
                Gọi refreshToken
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  await mockAuth.logout()
                  setDebugMessage('Đã logout (đã xóa cookie)')
                  readCookies()
                }}
              >
                Logout (mock)
              </Button>
            </div>

            {debugMessage && <p className="text-xs text-muted-foreground">{debugMessage}</p>}
          </div>
        )}
      </div>
    </form>
  )
}
