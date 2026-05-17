
export interface User {
    name: string
    avatar_url: string
}

export interface CommentData {
    content: string
    created_at: string
    user: User
    replies: CommentData[]
}