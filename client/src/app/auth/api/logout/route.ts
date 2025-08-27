import { cookies } from 'next/headers'
import { HttpError } from '@/app/lib/http'
import authApiRequest from '@/app/mock/mockAuth' // hoặc path tới file API thực tế

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const force = body?.force as boolean | undefined

    const cookieStore = cookies()
    const sessionTokenCookie = cookieStore.get('sessionToken')
    const sessionToken = sessionTokenCookie?.value

    if (force) {
      // Xóa cookie ngay lập tức khi force logout
      return new Response(
        JSON.stringify({ message: 'Buộc đăng xuất thành công' }),
        {
          status: 200,
          headers: {
            'Set-Cookie': `sessionToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
          }
        }
      )
    }

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ message: 'Không nhận được session token' }),
        { status: 401 }
      )
    }

    // Gọi API logout (mock hoặc thực tế)
    const result = await authApiRequest.logoutFromNextServerToServer(sessionToken)

    // Xóa cookie sau khi logout
    return new Response(JSON.stringify(result.payload), {
      status: 200,
      headers: {
        'Set-Cookie': `sessionToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
      }
    })
  } catch (error) {
    if (error instanceof HttpError) {
      return new Response(JSON.stringify(error.payload), {
        status: error.status
      })
    }

    return new Response(JSON.stringify({ message: 'Lỗi không xác định' }), {
      status: 500
    })
  }
}
