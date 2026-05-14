import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import ImageCarousel, { ProjectSubImage } from '@/components/image-carousell';
import DropLink, { ProjectSubLink } from '@/components/drop-link';
import ContributorInfo from '@/components/contributor-info';
import ProgressIndicator, { ProjectProgress } from '@/components/progress-indicator';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm'
import FetchingProjectPageSkeleton from '@/components/fetching-project-page-skeleton';


interface Contributor {
  id: number;
  name: string;
  githubUserName: string;
}

interface Contribution {
  id: number;
  level: string;
  description: string;
  contributor: Contributor;
}

interface ProjectSubPage {
  id: number;
  slug: string;
  title: string;
  nav_description: string;
  short_description: string;
  full_description: string;
}

interface FullProject {
  id: number;
  slug: string;
  title: string;
  progress: ProjectProgress;
  nav_description: string;
  short_description: string;
  full_description: string;
  created_at: string;
  links: ProjectSubLink[];
  images: ProjectSubImage[];
  project_sub_pages: ProjectSubPage[];
  contributions: Contribution[];
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<FullProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/projects/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setProject(data);
        setLoading(false);
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
            {project.contributions.map((contribution, contribution_index) => (
              <ContributorInfo key={contribution_index} contribution={contribution} />
            ))}
          </div>
        </div>
      </div>

      <ImageCarousel images={project.images} />

      <div className="p-4 prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {project.full_description}
        </ReactMarkdown>
      </div>
    </div>
  );
}
