import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { CommentData } from '@/types/comments'
import { useParams } from 'react-router-dom'

type CommentContextValue = [CommentData[], boolean, (parent_id: number | null) => Promise<void>]

const CommentsContext = createContext<CommentContextValue>([[], true, async (parent_id: number | null) => undefined])

export function CommentsProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)

  const fetch_comments = async (parent_id:number|null) => {
    try {
      let url = `/api/project/${slug}/comments`;
      if (parent_id !== null) {
        url += `?parent_id=${parent_id}`;
      }
      let response = await fetch(url)
      const data = response.ok ? await response.json() : [];
      setComments(data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <CommentsContext.Provider value={[ comments, loading, fetch_comments ]}>
      {children}
    </CommentsContext.Provider>
  )
}

export function useComments() {
  return useContext(CommentsContext)
}
