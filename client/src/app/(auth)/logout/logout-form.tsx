'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { mockAuth } from '@/app/mock/mockAuth'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { toast } from '@/app/components/ui/use-toast'

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

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null)
    try {
      const response = await mockAuth.login(data)

      if (response.success) {
        toast({
          title: 'Đăng nhập thành công',
          description: `Xin chào, ${response.data.account.name}`
        })
        window.location.href = '/dashboard' // redirect sau login
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
    </form>
  )
}
