import { useRecordings } from '../hooks/useRecordings'

function fmtDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-PT')
}

export function RecordingsPage() {
  const { data: recordings, loading, error } = useRecordings()

  return (
    <section className="workers-page">
      <h1>GESTÃO DE GRAVAÇÕES</h1>

      <div className="workers-card">
        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="table-wrap workers-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>ID Câmera</th>
                  <th>ID Evento</th>
                  <th>Duração (s)</th>
                  <th>Início</th>
                  <th>Criado em</th>
                  <th>Arquivo</th>
                </tr>
              </thead>
              <tbody>
                {recordings.map((r, index) => (
                  <tr key={r.id}>
                    <td>{index + 1}</td>
                    <td>{r.id}</td>
                    <td>{r.camera_id}</td>
                    <td>{r.event_id ?? '-'}</td>
                    <td>{r.duration_seconds ?? '-'}</td>
                    <td>{fmtDate(r.started_at)}</td>
                    <td>{fmtDate(r.created_at)}</td>
                    <td className="table-truncate" title={r.file_path}>
                      {r.file_path}
                    </td>
                  </tr>
                ))}
                {recordings.length === 0 && (
                  <tr>
                    <td colSpan={8}>Nenhuma gravação encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

