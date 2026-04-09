import { useEffect, useState } from 'react'
import { FEEDBACK_EVENT } from '../services/api'

type FeedbackVariant = 'success' | 'error'

interface ApiFeedbackDetail {
  variant: FeedbackVariant
  title: string
  message: string
  status?: number
}

export function ApiFeedbackModal() {
  const [feedback, setFeedback] = useState<ApiFeedbackDetail | null>(null)

  useEffect(() => {
    function handler(event: Event) {
      const custom = event as CustomEvent<ApiFeedbackDetail>
      setFeedback(custom.detail)
    }
    window.addEventListener(FEEDBACK_EVENT, handler as EventListener)
    return () => window.removeEventListener(FEEDBACK_EVENT, handler as EventListener)
  }, [])

  if (!feedback) return null

  return (
    <div className="api-feedback-backdrop" onClick={() => setFeedback(null)}>
      <div className="api-feedback-card" onClick={(e) => e.stopPropagation()}>
        <div className="api-feedback-head">
          <h3 className={feedback.variant === 'success' ? 'text-success' : 'text-error'}>
            {feedback.title}
          </h3>
          <button className="close-btn" onClick={() => setFeedback(null)}>
            X
          </button>
        </div>
        <p>{feedback.message}</p>
        {feedback.status && <small className="muted">Status HTTP: {feedback.status}</small>}
      </div>
    </div>
  )
}

