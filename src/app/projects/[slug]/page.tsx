import { Prisma, Project } from '@/generated/prisma';
import prisma from '@/lib/prisma';
import { MDXRemote } from 'next-mdx-remote/rsc'
import { useMDXComponents } from '@/mdx-components'
import React from 'react';
import Link from 'next/link';
import DropLink from './drop-link';
import ContributorInfo from './contributor-info';
import ProgressIndicator from './progress-indicator';
import ImageCarousel from './image-carousel';

// 1. Update your interface to treat params as a Promise
interface PageProps {
  params: Promise<{ slug: string }>
}

type FullProject = Prisma.ProjectGetPayload<{
    include: {
      links: true,
      project_sub_pages: true,
      contributions: {
        include: {
          contributor: true, // fetch the contributor for each contribution
        },
      },
      images: true
    },
  }>;

async function get_project(slug: string):Promise<FullProject|null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      links: true,
      project_sub_pages: true,
      images: true,
      contributions: {
        include: {
          contributor: true, // fetch the contributor for each contribution
        },
      }
    },
  });
  
  return project;
}

export default async function ProjectPage({ params }: PageProps) {
  // 2. Await the params Promise here
  const { slug } = await params; 
  
  const project = await get_project(slug);

  if (!project) return <div>Project not found!</div>;

  const components = useMDXComponents({});

  return (
    <div className='
      h-min-full w-full top-10 w-screen
      absolute left-0
      flex-1 dark:bg-black  bg-white
       pointer-events-auto
    '>
      <div className='flex'>
        <ProgressIndicator progress={project.progress}/>
        <h1 className='p-1 px-3 pt-1 flex justify-center flex-col'>{project.title}</h1>
      </div>
      <div className='
        sticky
        top-10 right-0
        z-10
      '>
        <div className='flex justify-between'>
          <div className='
          w-fit
          p-1
          flex
          gap-2
          flex-wrap
          '>
            {/* Links */}
            {project.links.map((link, link_index) => {
              return <DropLink key={link_index} link={link} />;
            })}
          </div>
          <div className='
            w-fit
            flex
            gap-2
            justify-end
            p-1
          '>
            {project.contributions.map((contribution, contribution_index) => {
              return <ContributorInfo key={contribution_index} contribution={contribution} />;
            })}
          </div>
        </div>
      </div>
      
      <ImageCarousel images={project.images}/>

      <MDXRemote 
        source={project.full_description} 
        components={components}
      />
    </div>
  );
}
