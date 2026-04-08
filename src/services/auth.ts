import { api } from './api'
import type { UserMe } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export async function loginRequest(payload: LoginPayload): Promise<string> {
  const { data } = await api.post<{ access_token: string }>('/api/v1/auth/login', payload)
  return data.access_token
}

export async function getMe(): Promise<UserMe> {
  const { data } = await api.get<UserMe>('/api/v1/auth/me')
  return data
}

