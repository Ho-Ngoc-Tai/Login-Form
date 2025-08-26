// /app/mock/mockAuth.ts

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

type LoginSuccess = {
  success: true
  message: string
  data: {
    token: string
    account: User
  }
}

type LoginFail = {
  success: false
  message: string
  data?: undefined
}

export type LoginResponse = LoginSuccess | LoginFail

export const mockAuth = {
  async login(values: LoginBodyType): Promise<LoginResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (values.email === MOCK_USER.email && values.password === '123123') {
      const token = 'fake-token-123'

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(MOCK_USER))

      return {
        success: true,
        message: 'Đăng nhập thành công (mock)',
        data: {
          token,
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    return {
      success: true,
      message: 'Đăng xuất thành công (mock)'
    }
  },

  async getProfile() {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      return {
        success: true as const,
        data: JSON.parse(userStr) as User
      }
    }

    return {
      success: false as const,
      message: 'Chưa đăng nhập'
    }
  }
}
