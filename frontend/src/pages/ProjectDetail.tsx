import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import DropLink, { ProjectSubLink } from '@/components/drop-link';
import ContributorInfo from '@/components/contributor-info';
import ProgressIndicator, { ProjectProgress } from '@/components/progress-indicator';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm'
import FetchingProjectPageSkeleton from '@/components/fetching-project-page-skeleton';
import { get_project_url } from '@/lib/utils';
import { ProjectConfig } from '@/types/project';
import ImageCarousel from '@/components/image-carousell';
import { useComments } from '@/lib/comments-context';
import Comment from '@/components/comment';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [projectAbout, setProjectAbout] = useState<string | null>(null);
  const [comments, loading_comments] = useComments()
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
      <a href="/api/login">login with google to comment</a>
      <div>
        {/* Comments */}
        {comments.map((comment, n) => <Comment comment={comment}/>)}
      </div>
    </div>
  );
}
