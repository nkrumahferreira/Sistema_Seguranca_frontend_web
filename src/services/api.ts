import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const TOKEN_KEY = 'ctos_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type FeedbackVariant = 'success' | 'error'

interface ApiFeedbackDetail {
  variant: FeedbackVariant
  title: string
  message: string
  status?: number
}

const FEEDBACK_EVENT = 'ctos:api-feedback'

function emitApiFeedback(detail: ApiFeedbackDetail) {
  window.dispatchEvent(new CustomEvent<ApiFeedbackDetail>(FEEDBACK_EVENT, { detail }))
}

function normalizeServerMessage(payload: any): string | null {
  if (!payload) return null
  if (typeof payload === 'string') return payload
  if (typeof payload.detail === 'string') return payload.detail
  if (Array.isArray(payload.detail)) return payload.detail.join(', ')
  if (typeof payload.message === 'string') return payload.message
  return null
}

function successTitleByStatus(status: number): string {
  if (status === 201) return 'Cadastro realizado com sucesso'
  if (status === 204) return 'Operação concluída com sucesso'
  return 'Operação realizada com sucesso'
}

function errorTitleByStatus(status: number): string {
  if (status === 400) return 'Requisição inválida'
  if (status === 401) return 'Sessão expirada ou acesso não autorizado'
  if (status === 403) return 'Acesso negado'
  if (status === 404) return 'Recurso não encontrado'
  if (status === 409) return 'Conflito de dados'
  if (status >= 500) return 'Erro interno no servidor'
  return 'Falha na operação'
}

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase() || ''
    const shouldNotifySuccess = ['post', 'put', 'patch', 'delete'].includes(method)
    if (shouldNotifySuccess) {
      const serverMessage =
        normalizeServerMessage(response.data) ||
        `Servidor respondeu com status ${response.status}.`
      emitApiFeedback({
        variant: 'success',
        title: successTitleByStatus(response.status),
        message: serverMessage,
        status: response.status,
      })
    }
    return response
  },
  (error) => {
    const status: number | undefined = error?.response?.status
    const message =
      normalizeServerMessage(error?.response?.data) ||
      error?.message ||
      'Não foi possível processar a solicitação.'

    if (status === 401) {
      setStoredToken(null)
    }

    emitApiFeedback({
      variant: 'error',
      title: status ? errorTitleByStatus(status) : 'Erro de conexão',
      message,
      status,
    })

    return Promise.reject(error)
  },
)

export { FEEDBACK_EVENT }

