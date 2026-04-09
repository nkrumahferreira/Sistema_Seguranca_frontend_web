import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useWorkers } from '../hooks/useWorkers'
import { API_BASE_URL } from '../utils/constants'

export function WorkersPage() {
  const {
    workers,
    loading,
    submitting,
    error,
    selectedWorker,
    detailLoading,
    detailError,
    addWorker,
    removeWorker,
    openWorkerDetails,
    closeWorkerDetails,
  } = useWorkers()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [workerType, setWorkerType] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [extraPhotos, setExtraPhotos] = useState<File[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 10

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

  const detailImages = selectedWorker
    ? [
        ...(selectedWorker.photo
          ? [
              {
                label: 'Foto principal',
                mime_type: selectedWorker.photo.mime_type,
                base64: selectedWorker.photo.base64,
              },
            ]
          : []),
        ...((selectedWorker.extra_photos || []) as Array<{ mime_type: string; base64: string }>).map(
          (photo, idx) => ({
            label: `Foto extra ${idx + 1}`,
            mime_type: photo.mime_type,
            base64: photo.base64,
          }),
        ),
      ]
    : []

  const safeImageIndex =
    detailImages.length > 0 ? Math.min(activeImageIndex, detailImages.length - 1) : 0
  const currentImage = detailImages[safeImageIndex]
  const workersStaticBase = API_BASE_URL.replace(/\/$/, '')
  const totalPages = Math.max(1, Math.ceil(workers.length / PAGE_SIZE))

  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return workers.slice(start, start + PAGE_SIZE)
  }, [workers, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

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
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Documento</th>
                  <th>Embedding</th>
                  <th>Ativo</th>
                  <th>Opções</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWorkers.map((worker, index) => (
                  <tr key={worker.id}>
                    <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                    <td>
                      {worker.photo_path ? (
                        <img
                          className="worker-table-photo"
                          src={`${workersStaticBase}/static/workers/${worker.photo_path}`}
                          alt={`Foto de ${worker.name}`}
                        />
                      ) : (
                        <span className="muted">Sem foto</span>
                      )}
                    </td>
                    <td>{worker.name}</td>
                    <td>
                      <span className="worker-type-badge">{worker.worker_type}</span>
                    </td>
                    <td>{worker.document_id || '-'}</td>
                    <td>{worker.has_embedding ? 'Sim' : 'Não'}</td>
                    <td>{worker.is_active ? 'Sim' : 'Não'}</td>
                    <td>
                      <button
                        className="secondary-btn"
                        onClick={() => {
                          setActiveImageIndex(0)
                          void openWorkerDetails(worker.id)
                        }}
                      >
                        Ver
                      </button>
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
                    <td colSpan={8}>Nenhum trabalhador encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {workers.length > 0 && (
          <div className="table-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Próxima
            </button>
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

      {(selectedWorker || detailLoading || detailError) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setActiveImageIndex(0)
            closeWorkerDetails()
          }}
        >
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Detalhes do trabalhador</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setActiveImageIndex(0)
                  closeWorkerDetails()
                }}
              >
                X
              </button>
            </div>

            {detailLoading && <p>Carregando trabalhador...</p>}
            {detailError && <p className="error">{detailError}</p>}

            {selectedWorker && !detailLoading && (
              <div className="worker-detail-grid">
                <p>
                  <strong>ID:</strong> {selectedWorker.id}
                </p>
                <p>
                  <strong>Nome:</strong> {selectedWorker.name}
                </p>
                <p>
                  <strong>Tipo:</strong> {selectedWorker.worker_type}
                </p>
                <p>
                  <strong>Documento:</strong> {selectedWorker.document_id || '-'}
                </p>
                <p>
                  <strong>Embedding:</strong> {selectedWorker.has_embedding ? 'Sim' : 'Não'}
                </p>
                <p>
                  <strong>Ativo:</strong> {selectedWorker.is_active ? 'Sim' : 'Não'}
                </p>

                <div className="worker-photo-block">
                  <strong>Fotos do trabalhador</strong>
                  {detailImages.length === 0 ? (
                    <p className="muted">Sem fotos cadastradas.</p>
                  ) : (
                    <>
                      <div className="worker-carousel">
                        <button
                          type="button"
                          className="carousel-nav-btn"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev <= 0 ? detailImages.length - 1 : prev - 1,
                            )
                          }
                          aria-label="Foto anterior"
                        >
                          {'<'}
                        </button>
                        <img
                          className="worker-photo-preview worker-photo-preview-lg"
                          src={`data:${currentImage.mime_type};base64,${currentImage.base64}`}
                          alt={`${currentImage.label} de ${selectedWorker.name}`}
                          onClick={() => setIsImageViewerOpen(true)}
                          role="button"
                          title="Clique para ampliar"
                        />
                        <button
                          type="button"
                          className="carousel-nav-btn"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev >= detailImages.length - 1 ? 0 : prev + 1,
                            )
                          }
                          aria-label="Próxima foto"
                        >
                          {'>'}
                        </button>
                      </div>
                      <p className="muted carousel-caption">
                        {currentImage.label} ({safeImageIndex + 1}/{detailImages.length})
                      </p>
                      {detailImages.length > 1 && (
                        <div className="worker-carousel-thumbs">
                          {detailImages.map((photo, idx) => (
                            <button
                              key={`${selectedWorker.id}-thumb-${idx}`}
                              type="button"
                              className={`worker-thumb-btn ${
                                idx === safeImageIndex ? 'active' : ''
                              }`}
                              onClick={() => setActiveImageIndex(idx)}
                              aria-label={`Abrir ${photo.label}`}
                            >
                              <img
                                className="worker-photo-thumb"
                                src={`data:${photo.mime_type};base64,${photo.base64}`}
                                alt={photo.label}
                                onClick={() => setIsImageViewerOpen(true)}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isImageViewerOpen && currentImage && (
        <div className="image-viewer-backdrop" onClick={() => setIsImageViewerOpen(false)}>
          <div className="image-viewer-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="image-viewer-close"
              onClick={() => setIsImageViewerOpen(false)}
              aria-label="Fechar imagem ampliada"
            >
              X
            </button>
            <img
              className="image-viewer-full"
              src={`data:${currentImage.mime_type};base64,${currentImage.base64}`}
              alt={`${currentImage.label} de ${selectedWorker?.name || 'trabalhador'}`}
            />
            <p className="muted carousel-caption">
              {currentImage.label} ({safeImageIndex + 1}/{detailImages.length})
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

