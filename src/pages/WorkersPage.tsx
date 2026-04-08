import { type FormEvent, useState } from 'react'
import { useWorkers } from '../hooks/useWorkers'

export function WorkersPage() {
  const { workers, loading, submitting, error, addWorker, removeWorker } = useWorkers()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [workerType, setWorkerType] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [extraPhotos, setExtraPhotos] = useState<File[]>([])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!photo) return
    await addWorker({
      name,
      workerType,
      documentId,
      photo,
      extraPhotos,
    })
    setName('')
    setWorkerType('')
    setDocumentId('')
    setPhoto(null)
    setExtraPhotos([])
    const photoInput = document.getElementById('worker-photo') as HTMLInputElement | null
    const extrasInput = document.getElementById('worker-extra-photos') as HTMLInputElement | null
    if (photoInput) photoInput.value = ''
    if (extrasInput) extrasInput.value = ''
    setIsModalOpen(false)
  }

  return (
    <section className="workers-page">
      <h1>GESTÃO DE TRABALHADORES</h1>

      <div className="workers-card">
        <div className="workers-toolbar">
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            + Cadastrar Trabalhador
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
                  <th>#</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Documento</th>
                  <th>Embedding</th>
                  <th>Ativo</th>
                  <th>Opções</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker, index) => (
                  <tr key={worker.id}>
                    <td>{index + 1}</td>
                    <td>{worker.name}</td>
                    <td>
                      <span className="worker-type-badge">{worker.worker_type}</span>
                    </td>
                    <td>{worker.document_id || '-'}</td>
                    <td>{worker.has_embedding ? 'Sim' : 'Não'}</td>
                    <td>{worker.is_active ? 'Sim' : 'Não'}</td>
                    <td>
                      <button
                        className="danger-btn"
                        onClick={() => {
                          if (window.confirm(`Remover trabalhador ${worker.name}?`)) {
                            void removeWorker(worker.id)
                          }
                        }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {workers.length === 0 && (
                  <tr>
                    <td colSpan={7}>Nenhum trabalhador encontrado.</td>
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
              <h2>Cadastrar trabalhador</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                X
              </button>
            </div>
            <form className="modal-form" onSubmit={onSubmit}>
              <input
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                placeholder="Tipo/Função (ex.: Segurança)"
                value={workerType}
                onChange={(e) => setWorkerType(e.target.value)}
                required
              />
              <input
                placeholder="Documento (opcional)"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />
              <label>
                Foto principal (obrigatória)
                <input
                  id="worker-photo"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </label>
              <label>
                Fotos extras (opcional)
                <input
                  id="worker-extra-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setExtraPhotos(Array.from(e.target.files || []))}
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn" disabled={submitting || !photo}>
                  {submitting ? 'Cadastrando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

