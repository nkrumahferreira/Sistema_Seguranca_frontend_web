import type { LocationType } from '../types'

export function locationTypeLabel(value: LocationType | string) {
  const map: Record<string, string> = {
    property: 'Propriedade',
    building: 'Edificio',
    floor: 'Piso',
    zone: 'Zona',
  }
  return map[value] || value
}

export function cameraStatusLabel(value: string) {
  const map: Record<string, string> = {
    unknown: 'Desconhecido',
    online: 'Online',
    offline: 'Offline',
    error: 'Erro',
  }
  return map[value] || value
}

