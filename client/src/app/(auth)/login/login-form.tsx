'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/app/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/app/components/ui/form'
import { Input } from '@/app/components/ui/input'
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema'
import { useToast } from '@/app/components/ui/use-toast'
import { useState } from 'react'
import { mockAuth } from '@/app/mock/mockAuth'
import { LoginResponse } from '@/app/mock/mockAuth'

const LoginForm = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: LoginBodyType) {
    if (loading) return
    setLoading(true)

    try {
      const result: LoginResponse = await mockAuth.login(values)

      if (result.success) {
        toast({
          description: result.message
        })
        localStorage.setItem('user', JSON.stringify(result.data.account))
      } else {
        toast({
          description: result.message,
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-2 max-w-[600px] flex-shrink-0 w-full'
        noValidate
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Nhập Email của bạn' type='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input placeholder='' type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='!mt-8 w-full'>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  )
}

export default LoginForm
