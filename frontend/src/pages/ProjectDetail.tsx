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
import { get_project_url, postComment } from '@/lib/utils';
import { ProjectConfig } from '@/types/project';
import ImageCarousel from '@/components/image-carousell';
import { useComments } from '@/lib/comments-context';
import Comment from '@/components/comment';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/user-context';
import { UserData } from '@/types/users';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [projectAbout, setProjectAbout] = useState<string | null>(null);
  const [comments, loading_comments] = useComments()
  const [user, loading_user] = useUser()
  const [loading, setLoading] = useState(true);
  const [comment_post_status, set_comment_post_status] = useState<string>("");
  const [comment_content, set_comment_content] = useState<string>("")

  const handleTextareaChange = (event:React.ChangeEvent<HTMLTextAreaElement>) => {
    set_comment_content(event.target.value); // Update state as the user types
  };

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
      {!loading_user && user ?
      <div className='m-4 rounded-2xl bg-gray-900'>
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
                <textarea placeholder={`Comment on ${project.title}...`} className='h-full resize-none w-full dark:bg-gray-800 bg-gray-200 p-2' onChange={handleTextareaChange} value={comment_content} name="" id=""></textarea>
                <div className='flex justify-end'>
                    <button className='bg-gray-500 pl-2 pr-2 rounded-r-2xl dark:hover:bg-gray-400 hover:bg-gray-600 cursor-pointer border-2 dark:hover:border-white hover:border-black border-transparent flex flex-col justify-center transition-all'
                        onClick={async e => {
                            postComment(comment_content, user, set_comment_post_status, undefined, slug)
                            window.location.reload()
                        }}>post</button>
                </div>
            </div>
        </div>
        {comment_post_status}
        </div>
        :
        <a href={`/api/login?return_uri=${encodeURIComponent(window.location.pathname)}`}>login with google to comment</a>
      }
      
      <div className='flex flex-col'>
        {comments.map((comment, n) => <Comment key={n} comment={comment}/>)}
      </div>
    </div>
  );
}
