import type { RiskLevel } from '../types'

export function riskColor(risk: RiskLevel | string | null | undefined): string {
  if (risk === 'critical') return '#ff4d4f'
  if (risk === 'suspicious' || risk === 'suspicious_visit') return '#ff9f1a'
  return '#22c55e'
}

export function riskLabel(risk: RiskLevel | string | null | undefined): string {
  if (risk === 'critical') return 'Crítico'
  if (risk === 'suspicious') return 'Suspeito'
  if (risk === 'suspicious_visit') return 'Visita suspeita'
  return 'Normal'
}

