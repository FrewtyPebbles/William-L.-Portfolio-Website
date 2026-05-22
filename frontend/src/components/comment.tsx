import { useUser } from '@/lib/user-context'
import { postComment } from '@/lib/utils'
import { CommentData } from '@/types/comments'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from './ui/button'

interface Props {
    comment:CommentData
}

export default function Comment({ comment }:Props) {
    const { slug } = useParams<{ slug: string }>();
    const [user, loading_user] = useUser()
    const [comment_post_status, set_comment_post_status] = useState<string>("");
    const [comment_content, set_comment_content] = useState<string>("")
    const [show_input, set_show_input] = useState<boolean>(false);
    const [show_replies, set_show_replies] = useState<boolean>(false);
    const handleTextareaChange = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        set_comment_content(event.target.value); // Update state as the user types
    };
    
    return (
        <div className='p-2'>
            <div className='p-4'>
                <div className='flex rounded-full'>
                    <img src={comment.avatar} alt={`${comment.author}'s avatar`}
                        className='p-2 h-15 w-15 rounded-full' />

                    <h2 className='text-2xl p-2 font-bold grow flex justify-center flex-col'>
                        {comment.author}
                    </h2>
                </div>
                <div className='border-l-5 rounded-b-2xl pt-5 pl-5 pr-5 pb-2'>
                    <div>
                        {comment.content}
                    </div>
                    <div className='text-right text-current/60'>
                        {comment.created_at}
                    </div>
                    {!loading_user && user && show_input ? 
                        <div className='m-4 rounded-2xl rounded-tl-none bg-gray-900'>
                        <div className='flex'>
                            <div>
                                <div className='flex justify-center pt-2'>
                                    <img src={user.avatar} alt="" className='h-10 w-10 rounded-full'/>
                                </div>
                                <div className='flex flex-col justify-center p-1'>
                                    {user.name}
                                </div>
                            </div>
                            <div className='grow flex'>
                                <textarea placeholder={`Reply...`} className='h-full resize-none w-full dark:bg-gray-800 bg-gray-200 p-2' onChange={handleTextareaChange} value={comment_content} name="" id=""></textarea>
                                <div className='flex justify-end'>
                                    <button className='bg-gray-500 pl-2 pr-2 rounded-r-2xl dark:hover:bg-gray-400 hover:bg-gray-600 cursor-pointer border-2 dark:hover:border-white hover:border-black border-transparent flex flex-col justify-center transition-all'
                                        onClick={async e => {
                                            postComment(comment_content, user, set_comment_post_status, comment.id, slug)
                                            set_show_input(false)
                                            window.location.reload()
                                        }}>reply</button>
                                </div>
                            </div>
                        </div>
                        {comment_post_status}
                        </div>
                        :
                        (!loading_user && user ? 
                            <div>
                                <button onClick={e => set_show_replies(!show_replies)} className='dark:hover:bg-gray-800 cursor-pointer'>
                                    {show_replies ? "Hide Replies" : "Show Replies"}
                                </button>
                                 <span> | </span>
                                <button onClick={e => set_show_input(true)} className='dark:hover:bg-gray-800 cursor-pointer'>
                                    Reply
                                </button>
                            </div>
                            :
                            <a href={`/api/login?return_uri=${encodeURIComponent(window.location.pathname)}`}>
                                Login with google to reply...
                            </a>
                        )
                    }
                    {
                        show_replies ?
                        <div>
                            {comment.replies.map((comment, n) => <Comment key={n} comment={comment}/>)}
                        </div>
                        :
                        <></>
                    }
                </div>
                
            </div>
        </div>
    )
}
