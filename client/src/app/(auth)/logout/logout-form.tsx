'use client'

import { useState } from 'react'
import authApiRequest from '@/lib/auth-context'
import { useAuth } from '@/lib/auth-context'

export default function LoginForm() {
    const { login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await authApiRequest.login({ username, password })
            // Giả sử backend trả về { accessToken, refreshToken, expiresAt }
            login({ username }, res.data.accessToken, res.data.expiresAt)
        } catch (err: any) {
            setError(err?.message || 'Login failed')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="text-red-500">{error}</div>}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Login
            </button>
        </form>
    )
}
