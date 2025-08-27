import { cookies } from 'next/headers'
import { HttpError } from '@/app/lib/http'
import authApiRequest from '@/app/mock/mockAuth' // hoặc path tới file API thực tế

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const sessionTokenCookie = cookieStore.get('sessionToken')
    const sessionToken = sessionTokenCookie?.value

    if (!sessionToken) {
      return new Response(JSON.stringify({ message: 'Không nhận được session token' }), {
        status: 401
      })
    }

    // Gọi API slide session (cập nhật thời gian hết hạn)
    const res = await authApiRequest.slideSessionFromNextServerToServer(sessionToken)

    const newExpiresDate = new Date(res.payload.data.expiresAt).toUTCString()

    // Trả cookie mới với thời gian hết hạn mới
    return new Response(JSON.stringify(res.payload), {
      status: 200,
      headers: {
        'Set-Cookie': `sessionToken=${sessionToken}; Path=/; HttpOnly; Expires=${newExpiresDate}; SameSite=Lax; Secure`
      }
    })
  } catch (error) {
    if (error instanceof HttpError) {
      return new Response(JSON.stringify(error.payload), { status: error.status })
    }

    return new Response(JSON.stringify({ message: 'Lỗi không xác định' }), { status: 500 })
  }
}
