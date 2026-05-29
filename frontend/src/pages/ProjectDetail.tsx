import { ChangeEvent, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DropLink, { ProjectSubLink } from '@/components/drop-link';
import ContributorInfo from '@/components/contributor-info';
import ProgressIndicator, { ProjectProgress } from '@/components/progress-indicator';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm'
import FetchingProjectPageSkeleton from '@/components/fetching-project-page-skeleton';
import { get_project_url, postComment, usePrefersDark } from '@/lib/utils';
import { ProjectConfig } from '@/types/project';
import ImageCarousel from '@/components/image-carousell';
import { useComments } from '@/lib/comments-context';
import Comment from '@/components/comment';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/user-context';
import { UserData } from '@/types/users';
import { CommentData } from '@/types/comments';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [projectAbout, setProjectAbout] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(get_project_url(`${slug}/config.json`))
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setProject(data);
        
        // now fetch the about.md
        fetch(get_project_url(`${slug}/about.md`))
        .then(r => r.ok ? r.text() : null)
        .then(data => {
          setProjectAbout(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <FetchingProjectPageSkeleton/>;
  if (!project) return <div className="h-min-full w-full top-10 w-screen absolute left-0 flex-1 dark:bg-black bg-white pointer-events-auto"><p className="p-10">Project not found!</p></div>;

  return (
    <div className='h-min-screen w-full top-10 w-screen absolute left-0 flex-1 dark:bg-black bg-white pointer-events-auto'>
      <div className='flex'>
        <ProgressIndicator progress={project.progress} />
        <h1 className='p-1 px-3 pt-1 flex justify-center flex-col'>{project.title}</h1>
      </div>
      <div className='sticky top-10 right-0 z-10'>
        <div className='flex justify-between'>
          <div className='w-fit p-1 flex gap-2 flex-wrap'>
            {project.links.map((link, link_index) => (
              <DropLink key={link_index} link={link} />
            ))}
          </div>
          <div className='w-fit flex gap-2 justify-end p-1'>
            {project.contributors.map((contributor, contribution_index) => (
              <ContributorInfo key={contribution_index} contribution={contributor} />
            ))}
          </div>
        </div>
      </div>

      <ImageCarousel images={project.images} project={project} />

      <div className="p-4 prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {projectAbout}
        </ReactMarkdown>
      </div>
      {/* This is the comments section, it is still in development. */}
      <CommentsSection project={project} slug={slug}/>
    </div>
  );
}

interface CommentsSectionProps {
  project:ProjectConfig;
  slug?:string
}

function CommentsSection({project, slug}:CommentsSectionProps) {
  const [user, loading_user] = useUser()
  const [comment_post_status, set_comment_post_status] = useState<string>("");
  const [comment_content, set_comment_content] = useState<string>("")
  const [comments, loading_comments, fetch_comments] = useComments()
  const handleTextareaChange = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
    set_comment_content(event.target.value); // Update state as the user types
  };

  useEffect(() => {
    fetch_comments(null)
  }, [])

  let login_with_google_link = `/api/login?return_uri=${encodeURIComponent(window.location.pathname)}`

  let post_comment_section = (
    <div className='flex gap-4 p-2'>
      <SignInWithGoogle href={login_with_google_link}/>
      <span className='align-middle flex flex-col justify-center'>
        to comment.
      </span>
    </div>
  );
  if (!loading_user && user) {
    
    post_comment_section = (
      <div className='m-4'>
        <div className='flex'>
            <div>
                <div className='flex justify-center pt-2'>
                    <img onClick={(e) => window.location = login_with_google_link as string & Location} src={user.avatar} alt="" className='h-10 w-10 rounded-full'/>
                </div>
                <div className='flex flex-col justify-center p-1'>
                    {user.name}
                </div>
            </div>
            <div className='grow flex'>
                <textarea placeholder={`Comment on ${project.title}...`} className='
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
                            let success = await postComment(comment_content, user, set_comment_post_status, undefined, slug)
                            if (success) {
                              set_comment_content("")
                              fetch_comments(null)
                            }
                        }}>post</button>
                </div>
            </div>
        </div>
        {comment_post_status}
      </div>
    );
  }

  let comments_section = <div>Loading comments section...</div>

  if (!loading_comments && comments !== null) {
    comments_section = (
      <div className='flex flex-col pl-2 pr-4'>
        {comments.map((comment, n) => <Comment key={n} comment={comment}/>)}
      </div>
    )
  }

  return (<div>
    {post_comment_section}
    
    {comments_section}
  </div>
  )
}

function SignInWithGoogle({className, href}:{className?:string, href:string}) {
  return (
    <button onClick={(e) => window.location = href as string & Location} className="gsi-material-button">
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{display: "block"}}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
        <span className="gsi-material-button-contents">Sign in with Google</span>
        <span style={{display: "none"}}>Sign in with Google</span>
      </div>
    </button>
  )
}