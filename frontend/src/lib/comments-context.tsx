import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { CommentData } from '@/types/comments'
import { useParams } from 'react-router-dom'

type CommentContextValue = [CommentData[], boolean]

const CommentsContext = createContext<CommentContextValue>([[],true])

export function CommentsProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/project/${slug}/comments`)
      .then(c => c.ok ? c.json() : [])
      .then((c) => {
      setComments(c)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <CommentsContext.Provider value={[ comments, loading ]}>
      {children}
    </CommentsContext.Provider>
  )
}

export function useComments() {
  return useContext(CommentsContext)
}
