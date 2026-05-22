import { UserData } from '@/types/users'

export interface CommentData {
    id: number
    content: string
    created_at: string
    author: string
    avatar: string
    replies: CommentData[]
}