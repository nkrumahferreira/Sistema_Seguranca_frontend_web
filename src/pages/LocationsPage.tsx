import { type FormEvent, useMemo, useState } from 'react'
import { useLocations } from '../hooks/useLocations'
import type { LocationTreeItem, LocationType } from '../types'
import { locationTypeLabel } from '../utils/labels'

function TreeNode({ node, level = 0 }: { node: LocationTreeItem; level?: number }) {
  return (
    <>
      <tr>
        <td>{node.id}</td>
        <td style={{ paddingLeft: `${level * 16 + 8}px` }}>{node.name}</td>
        <td>{locationTypeLabel(node.type)}</td>
        <td>{node.parent_id ?? '-'}</td>
        <td className="table-truncate" title={node.map_image || '-'}>
          {node.map_image || '-'}
        </td>
      </tr>
      {node.children.map((child) => (
        <TreeNode key={child.id} node={child} level={level + 1} />
      ))}
    </>
  )
}

export function LocationsPage() {
  const { data, tree, loading, submitting, error, addLocation } = useLocations()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<LocationType>('zone')
  const [parentId, setParentId] = useState<number | ''>('')
  const [mapImageFile, setMapImageFile] = useState<File | null>(null)

  const flatOptions = useMemo(
    () =>
      data.map((loc) => ({
        id: loc.id,
        label: `${loc.name} (${locationTypeLabel(loc.type)})`,
      })),
    [data],
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    await addLocation(
      {
        name,
        type,
        parent_id: parentId === '' ? null : Number(parentId),
        map_image: null,
      },
      mapImageFile,
    )
    setName('')
    setType('zone')
    setParentId('')
    setMapImageFile(null)
    setIsModalOpen(false)
  }

  return (
    <section className="workers-page">
      <h1>GESTAO DE LOCALIZACOES</h1>

      <div className="workers-card">
        <div className="workers-toolbar">
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            + Cadastrar localizacao
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-wrap workers-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Pai</th>
                  <th>Imagem do mapa</th>
                </tr>
              </thead>
              <tbody>
                {tree.map((node) => (
                  <TreeNode key={node.id} node={node} />
                ))}
                {tree.length === 0 && (
                  <tr>
                    <td colSpan={5}>Nenhuma localizacao encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Cadastrar localizacao</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                X
              </button>
            </div>
            <form className="modal-form" onSubmit={onSubmit}>
              <input
                placeholder="Nome da localizacao"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>
                Tipo
                <select value={type} onChange={(e) => setType(e.target.value as LocationType)}>
                  <option value="property">Propriedade</option>
                  <option value="building">Edificio</option>
                  <option value="floor">Piso</option>
                  <option value="zone">Zona</option>
                </select>
              </label>
              <label>
                Pai (opcional)
                <select value={parentId} onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Sem pai</option>
                  {flatOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Imagem do mapa (opcional)
                <input type="file" accept="image/*" onChange={(e) => setMapImageFile(e.target.files?.[0] || null)} />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={submitting || !name.trim()}>
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

