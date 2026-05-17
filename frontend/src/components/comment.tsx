import { CommentData } from '@/types/comments'
import React from 'react'

interface Props {
    comment:CommentData
}

export default function Comment({ comment }:Props) {
  return (
    <div className='ml-1'>
        <img src={comment.user.avatar_url} alt={`${comment.user.name}'s avatar`} />

        <div>
            {comment.user.name}
        </div>

        <div>
            {comment.content}
        </div>

        <div>
            {comment.created_at}
        </div>

        {comment.replies.map((comment, n) => <Comment comment={comment}/>)}
        
    </div>
  )
}
