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
import { mockAuth } from '@/app/mock/mockAuth'
import { useToast } from '@/app/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppContext } from '@/app/app-provider'
import Cookies from 'js-cookie'

const RegisterForm = () => {
    const [loading, setLoading] = useState(false)
    const { setUser } = useAppContext()
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<RegisterBodyType>({
        resolver: zodResolver(RegisterBody),
        defaultValues: {
            email: '',
            name: '',
            password: '',
            confirmPassword: ''
        }
    })

    async function onSubmit(values: RegisterBodyType) {
        if (loading) return
        setLoading(true)
        try {
            const result = await mockAuth.register(values)
            if (!result.success) throw new Error(result.message)

            // Lưu accessToken + refreshToken vào cookie
            const { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } =
                result.data.tokens
            Cookies.set('accessToken', accessToken, { expires: new Date(accessTokenExpiresAt), sameSite: 'lax' })
            Cookies.set('refreshToken', refreshToken, { expires: new Date(refreshTokenExpiresAt), sameSite: 'lax' })

            setUser(result.data.account)
            toast({ description: result.message })
            router.push('/me')
        } catch (error: any) {
            form.setError('email', { message: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2 max-w-[600px] flex-shrink-0 w-full' noValidate>
                {/* FormField name/email/password/confirmPassword giữ nguyên */}
                <Button type='submit' className='!mt-8 w-full' disabled={loading}>
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
            </form>
        </Form>
    )
}

export default RegisterForm
