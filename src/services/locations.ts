import { api } from './api'
import type { LocationItem, LocationTreeItem, LocationType } from '../types'

export interface CreateLocationPayload {
  name: string
  type: LocationType
  parent_id?: number | null
  map_image?: string | null
}

export async function fetchLocations(): Promise<LocationItem[]> {
  const { data } = await api.get<LocationItem[]>('/api/v1/locations')
  return data
}

export async function fetchLocationsTree(): Promise<LocationTreeItem[]> {
  const { data } = await api.get<LocationTreeItem[]>('/api/v1/locations/tree')
  return data
}

export async function createLocation(payload: CreateLocationPayload): Promise<LocationItem> {
  const { data } = await api.post<LocationItem>('/api/v1/locations', payload)
  return data
}

export async function uploadLocationMapImage(locationId: number, file: File): Promise<LocationItem> {
  const formData = new FormData()
  formData.append('map_image', file)
  const { data } = await api.post<LocationItem>(`/api/v1/locations/${locationId}/map-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

