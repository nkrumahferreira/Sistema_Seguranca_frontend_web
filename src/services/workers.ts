import { api } from './api'
import type { Worker } from '../types'

export interface CreateWorkerPayload {
  name: string
  workerType: string
  documentId?: string
  photo: File
  extraPhotos?: File[]
}

export async function fetchWorkers(): Promise<Worker[]> {
  const { data } = await api.get<Worker[]>('/api/v1/workers')
  return data
}

export async function createWorker(payload: CreateWorkerPayload): Promise<Worker> {
  const form = new FormData()
  form.append('name', payload.name)
  form.append('worker_type', payload.workerType)
  if (payload.documentId?.trim()) {
    form.append('document_id', payload.documentId.trim())
  }
  form.append('photo', payload.photo)
  for (const extra of payload.extraPhotos || []) {
    form.append('extra_photos', extra)
  }

  const { data } = await api.post<Worker>('/api/v1/workers', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteWorker(workerId: number): Promise<void> {
  await api.delete(`/api/v1/workers/${workerId}`)
}

