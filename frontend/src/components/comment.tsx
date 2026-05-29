import { useUser } from '@/lib/user-context'
import { postComment } from '@/lib/utils'
import { CommentData } from '@/types/comments'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface Props {
    comment:CommentData
    is_admin:boolean
    parent_fetch:(parent_id:number|null) => Promise<void>
}

export default function Comment({ comment, is_admin, parent_fetch }:Props) {
    const { slug } = useParams<{ slug: string }>();
    const [user, loading_user] = useUser()
    const [comment_post_status, set_comment_post_status] = useState<string>("");
    const [comment_content, set_comment_content] = useState<string>("")
    const [show_input, set_show_input] = useState<boolean>(false);
    const [show_replies, set_show_replies] = useState<boolean>(false);
    const [replies, setComments] = useState<CommentData[]>([])
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

    let admin_control = <></>

    const delete_comment = async () => {
        let response = await fetch(`/api/project/${slug}/comments?comment_id=${comment.id}`,
            {
                method:"DELETE",
            }
        )
        if (response.ok) {
            await parent_fetch(null)
        }
    }

    
    if (is_admin) {
        admin_control = <button
            onClick={_ => delete_comment()}
            className='w-10 h-10 bg-red-500 border-2 rounded-10 cursor-pointer'
        >X</button>
    }

    const handleTextareaChange = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
        set_comment_content(event.target.value); // Update state as the user types
    };

    let show_hide_replies_button = (
        replies.length ? 
            <button onClick={e => set_show_replies(!show_replies)} className='dark:hover:bg-gray-800 cursor-pointer  text-current/70'>
                {show_replies ? "- Hide Replies" : "↯ Show Replies"}
            </button>
            :
            <></>
    )
    

    let comment_replies_interface_separator = replies.length ? <span> | </span> : <></>

    let comment_replies_interface = (<div>
            {show_hide_replies_button}
            {comment_replies_interface_separator}
            <a href={`/api/login?return_uri=${encodeURIComponent(window.location.pathname)}`} className='
                dark:hover:bg-gray-800 cursor-pointer text-current/70
            '>
                Login with google to reply...
            </a>
        </div>)
    
    if (!loading_user && user) {
        comment_replies_interface = (<div>
            {show_hide_replies_button}
            {comment_replies_interface_separator}
            <button onClick={e => set_show_input(!show_input)} className='dark:hover:bg-gray-800 cursor-pointer text-current/70'>
                Reply {show_input ? "-" : "+"}
            </button>
        </div>)
    }

    return (
        <div className='p-2 pr-0'>
            <div className='p-1 border-l-5 rounded-2xl border-transparent dark:hover:border-gray-500/50 transition-all'>
                <div className='flex rounded-full'>
                    <img src={comment.avatar} alt={`${comment.author}'s avatar`}
                        className='p-2 h-15 w-15 rounded-full' />

                    <h2 className='text-2xl p-2 font-bold grow flex justify-center flex-col'>
                        {comment.author}
                    </h2>
                </div>
                <div className='pt-5 pl-5 pb-2'>
                    <div>
                        {comment.content}
                    </div>
                    <div className='flex justify-between'>
                        {comment_replies_interface}
                        <div className='text-right text-current/50'>
                            Posted {comment.created_at.replace("AM", "a.m.").replace("PM", "p.m.")} {admin_control}
                        </div>
                    </div>
                    {!loading_user && user && show_input ? 
                            <div className='m-4'>
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
                                        <textarea placeholder={`Reply...`} className='
                                            h-full 
                                            resize-none 
                                            w-full 
                                            focus:outline-none
                                            focus:dark:bg-[linear-gradient(to_left,var(--color-gray-800),var(--color-gray-950))]
                                            dark:bg-[linear-gradient(to_left,var(--color-gray-800),black)]
                                            focus:bg-[linear-gradient(to_left,var(--color-gray-400),var(--color-gray-50))]
                                            bg-[linear-gradient(to_left,var(--color-gray-400),white)]
                                            p-2
                                        ' onChange={handleTextareaChange} value={comment_content} name="" id=""></textarea>
                                        <div className='flex justify-end'>
                                            <button className='
                                                rounded-r-full
                                                relative overflow-hidden bg-gray-500 pl-5 pr-2 cursor-pointer
                                                flex flex-col justify-center 
                                                dark:bg-[linear-gradient(to_left,var(--color-gray-950),var(--color-gray-800))]
                                                bg-[linear-gradient(to_left,var(--color-gray-50),var(--color-gray-400))]

                                                /* gradient pseudoelement */
                                                dark:before:bg-[linear-gradient(to_left,rgba(255,255,255,0.4),transparent)]
                                                before:bg-[linear-gradient(to_left,rgba(0,0,0,0.4),transparent)]
                                                before:absolute before:inset-0 

                                                /* create a transition */
                                                before:opacity-0 before:transition-opacity before:duration-300
                                                hover:before:opacity-100
                                                '
                                                onClick={async e => {
                                                    let success = await postComment(comment_content, user, set_comment_post_status, comment.id, slug)
                                                    if (success) {
                                                        set_show_input(false)
                                                        set_show_replies(true)
                                                        set_comment_content("")
                                                        fetch_comments(comment.id)
                                                    }
                                                }}>reply</button>
                                        </div>
                                    </div>
                                </div>
                                {comment_post_status}
                                </div>
                            :
                            <></>
                        }
                        {
                            show_replies ?
                            <div>
                                {(replies.length ? replies : comment.replies).map((comment, n) => <Comment key={n} comment={comment} is_admin={is_admin} parent_fetch={fetch_comments} />)}
                            </div>
                            :
                            <></>
                        }
                </div>
                
            </div>
        </div>
    )
}
