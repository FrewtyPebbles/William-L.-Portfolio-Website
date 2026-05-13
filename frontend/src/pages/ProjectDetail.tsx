import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface ProjectSubLink {
  id: number;
  title: string;
  description: string;
  link: string;
}

interface ProjectSubImage {
  id: number;
  src: string;
  title: string;
  description: string;
}

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
  progress: string;
  nav_description: string;
  short_description: string;
  full_description: string;
  created_at: string;
  links: ProjectSubLink[];
  images: ProjectSubImage[];
  project_sub_pages: ProjectSubPage[];
  contributions: Contribution[];
}

function DropLink({ link }: { link: ProjectSubLink }) {
  return (
    <div className='bg-white/10 backdrop-blur-sm rounded-sm p-2 dark:text-white text-black border border-white/20'>
      <a href={link.link} target="_blank" rel="noopener noreferrer" className='hover:underline hover:text-blue-400'>
        <div className='flex flex-col'>
          <span className='font-bold text-sm'>{link.title}</span>
          {link.description && <span className='text-xs opacity-70'>{link.description}</span>}
        </div>
      </a>
    </div>
  );
}

function ContributorInfo({ contribution }: { contribution: Contribution }) {
  return (
    <div className='bg-white/10 backdrop-blur-sm rounded-sm p-2 dark:text-white text-black border border-white/20 text-xs text-right'>
      <div>{contribution.contributor.name}</div>
      <div className='opacity-70'>{contribution.level.replace(/_/g, ' ')}</div>
      {contribution.description && <div className='opacity-50'>{contribution.description}</div>}
    </div>
  );
}

function ProgressIndicator({ progress }: { progress: string }) {
  const colors: Record<string, string> = {
    PROTOTYPING: 'bg-red-500',
    DEVELOPMENT: 'bg-yellow-500',
    ALPHA: 'bg-orange-500',
    BETA: 'bg-blue-500',
    RELEASE: 'bg-green-500',
  };
  return (
    <div className={`w-4 h-full min-h-8 ${colors[progress] || 'bg-gray-500'}`} title={progress} />
  );
}

function ImageCarousel({ images }: { images: ProjectSubImage[] }) {
  if (images.length === 0) return null;
  return (
    <div className='flex overflow-x-auto gap-2 p-2'>
      {images.map((img, i) => (
        <img key={i} src={img.src.startsWith("http") ? img.src : `/static/uploads/${img.src}`} alt={img.title || ''} className='max-h-64 rounded-sm' />
      ))}
    </div>
  );
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

  if (loading) return <div className="h-min-full w-full top-10 w-screen absolute left-0 flex-1 dark:bg-black bg-white pointer-events-auto"><p className="p-10">Loading...</p></div>;
  if (!project) return <div className="h-min-full w-full top-10 w-screen absolute left-0 flex-1 dark:bg-black bg-white pointer-events-auto"><p className="p-10">Project not found!</p></div>;

  return (
    <div className='h-min-full w-full top-10 w-screen absolute left-0 flex-1 dark:bg-black bg-white pointer-events-auto'>
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
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {project.full_description}
        </ReactMarkdown>
      </div>
    </div>
  );
}
