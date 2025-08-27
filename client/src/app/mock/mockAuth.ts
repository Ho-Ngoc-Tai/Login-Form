// client/src/app/mock/mockAuth.ts
import Cookies from 'js-cookie'

export type LoginBodyType = {
  email: string
  password: string
}

type User = {
  name: string
  email: string
}

const MOCK_USER: User = {
  name: 'Demo User',
  email: 'demo@gmail.com'
}

type TokenData = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: number
  refreshTokenExpiresAt: number
}

type LoginSuccess = {
  success: true
  message: string
  data: {
    tokens: TokenData
    account: User
  }
}

type LoginFail = {
  success: false
  message: string
}

export type LoginResponse = LoginSuccess | LoginFail

const ACCESS_TOKEN_TTL = 10 * 1000 // 10s
const REFRESH_TOKEN_TTL = 60 * 1000 // 60s

const COOKIE_OPTIONS = {
  secure: false, // true nếu deploy https
  sameSite: 'lax' as const,
  path: '/'
}

export const mockAuth = {
  async login(values: LoginBodyType): Promise<LoginResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (values.email === MOCK_USER.email && values.password === '123123') {
      const now = Date.now()
      const tokens: TokenData = {
        accessToken: 'fake-access-' + Math.random().toString(36).slice(2),
        refreshToken: 'fake-refresh-' + Math.random().toString(36).slice(2),
        accessTokenExpiresAt: now + ACCESS_TOKEN_TTL,
        refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL
      }

      // Lưu cookie thay vì localStorage
      Cookies.set('accessToken', tokens.accessToken, {
        ...COOKIE_OPTIONS,
        expires: tokens.accessTokenExpiresAt / 1000 / 60 / 60 / 24 // convert ms -> days
      })
      Cookies.set('refreshToken', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        expires: tokens.refreshTokenExpiresAt / 1000 / 60 / 60 / 24
      })
      Cookies.set('accessTokenExpiresAt', tokens.accessTokenExpiresAt.toString(), COOKIE_OPTIONS)
      Cookies.set('refreshTokenExpiresAt', tokens.refreshTokenExpiresAt.toString(), COOKIE_OPTIONS)
      Cookies.set('user', JSON.stringify(MOCK_USER), COOKIE_OPTIONS)

      return {
        success: true,
        message: 'Đăng nhập thành công (mock)',
        data: {
          tokens,
          account: MOCK_USER
        }
      }
    }

    return {
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    }
  },

  async logout() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    Cookies.remove('accessToken', COOKIE_OPTIONS)
    Cookies.remove('refreshToken', COOKIE_OPTIONS)
    Cookies.remove('accessTokenExpiresAt', COOKIE_OPTIONS)
    Cookies.remove('refreshTokenExpiresAt', COOKIE_OPTIONS)
    Cookies.remove('user', COOKIE_OPTIONS)

    return {
      success: true,
      message: 'Đăng xuất thành công (mock)'
    }
  },

  async getProfile() {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const accessToken = Cookies.get('accessToken')
    const accessTokenExpiresAt = Number(Cookies.get('accessTokenExpiresAt'))
    const userStr = Cookies.get('user')

    if (!accessToken || !userStr) {
      return { success: false as const, status: 401, message: 'Chưa đăng nhập' }
    }

    if (Date.now() > accessTokenExpiresAt) {
      return { success: false as const, status: 401, message: 'Access token expired' }
    }

    return {
      success: true as const,
      data: JSON.parse(userStr) as User
    }
  },

  async refreshToken() {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const refreshToken = Cookies.get('refreshToken')
    const refreshTokenExpiresAt = Number(Cookies.get('refreshTokenExpiresAt'))

    if (!refreshToken) {
      return { success: false as const, status: 401, message: 'Không có refresh token' }
    }

    if (Date.now() > refreshTokenExpiresAt) {
      return { success: false as const, status: 401, message: 'Refresh token expired' }
    }

    const now = Date.now()
    const newAccessToken = 'fake-access-' + Math.random().toString(36).slice(2)
    const newAccessTokenExpiresAt = now + ACCESS_TOKEN_TTL

    Cookies.set('accessToken', newAccessToken, {
      ...COOKIE_OPTIONS,
      expires: newAccessTokenExpiresAt / 1000 / 60 / 60 / 24
    })
    Cookies.set('accessTokenExpiresAt', newAccessTokenExpiresAt.toString(), COOKIE_OPTIONS)

    return {
      success: true as const,
      data: {
        accessToken: newAccessToken,
        accessTokenExpiresAt: newAccessTokenExpiresAt
      }
    }
  },

  getTokens(): TokenData | null {
    const accessToken = Cookies.get('accessToken')
    const refreshToken = Cookies.get('refreshToken')
    const accessTokenExpiresAt = Number(Cookies.get('accessTokenExpiresAt'))
    const refreshTokenExpiresAt = Number(Cookies.get('refreshTokenExpiresAt'))

    if (!accessToken || !refreshToken) return null
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt
    }
  }
}
