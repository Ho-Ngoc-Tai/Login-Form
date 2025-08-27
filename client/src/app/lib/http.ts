// src/app/lib/http.ts
import envConfig from '@/config'
import { normalizePath } from '@/app/lib/utils'
import { LoginResType } from '@/schemaValidations/auth.schema'
import { redirect } from 'next/navigation'
import Cookies from 'js-cookie'

type CustomOptions = Omit<RequestInit, 'method'> & { baseUrl?: string }

const ENTITY_ERROR_STATUS = 422
const AUTHENTICATION_ERROR_STATUS = 401

type EntityErrorPayload = {
  message: string
  errors: { field: string; message: string }[]
}

export class HttpError extends Error {
  status: number
  payload: { message: string; [key: string]: any }
  constructor({ status, payload }: { status: number; payload: any }) {
    super('Http Error')
    this.status = status
    this.payload = payload
  }
}

export class EntityError extends HttpError {
  status: 422
  payload: EntityErrorPayload
  constructor({ status, payload }: { status: 422; payload: EntityErrorPayload }) {
    super({ status, payload })
    this.status = status
    this.payload = payload
  }
}

let clientLogoutRequest: null | Promise<any> = null
export const isClient = () => typeof window !== 'undefined'

async function refreshAccessToken() {
  try {
    const refreshToken = Cookies.get('refreshToken')
    if (!refreshToken) throw new Error('No refresh token')

    const res = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) throw new Error('Refresh token expired')

    const data = await res.json() as { token: string; expiresAt: string }
    Cookies.set('accessToken', data.token, { expires: 1 / 24 }) // 1 giờ
    return data.token
  } catch (err) {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    location.href = '/login'
    throw err
  }
}

const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options?: CustomOptions
) => {
  let body: FormData | string | undefined
  if (options?.body instanceof FormData) body = options.body
  else if (options?.body) body = JSON.stringify(options.body)

  const baseHeaders: { [key: string]: string } =
    body instanceof FormData ? {} : { 'Content-Type': 'application/json' }

  if (isClient()) {
    const accessToken = Cookies.get('accessToken')
    if (accessToken) baseHeaders.Authorization = `Bearer ${accessToken}`
  }

  const baseUrl = options?.baseUrl ?? envConfig.NEXT_PUBLIC_API_ENDPOINT
  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`

  let res = await fetch(fullUrl, {
    ...options,
    headers: { ...baseHeaders, ...options?.headers } as any,
    body,
    method,
  })

  let payload: Response = await res.json()
  let data = { status: res.status, payload }

  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) throw new EntityError(data as any)
    if (res.status === AUTHENTICATION_ERROR_STATUS && isClient()) {
      try {
        const newToken = await refreshAccessToken()
        baseHeaders.Authorization = `Bearer ${newToken}`
        // Retry request với token mới
        res = await fetch(fullUrl, { ...options, headers: { ...baseHeaders, ...options?.headers } as any, body, method })
        payload = await res.json()
        data = { status: res.status, payload }
        if (!res.ok) throw new HttpError(data)
      } catch {
        throw new HttpError(data)
      }
    } else if (!isClient()) {
      const sessionToken = (options?.headers as any)?.Authorization?.split('Bearer ')[1]
      redirect(`/logout?sessionToken=${sessionToken}`)
    } else {
      throw new HttpError(data)
    }
  }

  if (isClient()) {
    const path = normalizePath(url)
    if (['auth/login', 'auth/register'].includes(path)) {
      const { token, expiresAt, refreshToken } = (payload as LoginResType).data
      Cookies.set('accessToken', token, { expires: 1 / 24 })
      if (refreshToken) Cookies.set('refreshToken', refreshToken, { expires: 7 })
    } else if (path === 'auth/logout') {
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
    }
  }

  return data
}

const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('GET', url, options)
  },
  post<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('POST', url, { ...options, body })
  },
  put<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('PUT', url, { ...options, body })
  },
  delete<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('DELETE', url, { ...options })
  },
}

export default http
