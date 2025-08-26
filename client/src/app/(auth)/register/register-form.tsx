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
import { RegisterBody, RegisterBodyType } from '@/schemaValidations/auth.schema'
import { useToast } from '@/app/components/ui/use-toast'
import { useState } from 'react'
import { mockAuth, RegisterResponse } from '@/app/mock/mockAuth'

const RegisterForm = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<RegisterBodyType>({
    resolver: zodResolver(RegisterBody),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  async function onSubmit(values: RegisterBodyType) {
    if (loading) return
    setLoading(true)

    try {
      const result: RegisterResponse = await mockAuth.register(values)

      if (result.success) {
        toast({
          description: result.message
        })
        localStorage.setItem('user', JSON.stringify(result.data.account))
        localStorage.setItem('token', result.data.token)
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
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input placeholder='Nhập họ và tên của bạn' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Nhập email' type='email' {...field} />
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
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nhập lại mật khẩu</FormLabel>
              <FormControl>
                <Input placeholder='' type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='!mt-8 w-full'>
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </Button>
      </form>
    </Form>
  )
}

export default RegisterForm
