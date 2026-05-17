"use client"

import { Link } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useNav } from '@/lib/nav-context'
import { useIsMobile } from '@/lib/use-mobile'
import { get_asset_url } from '@/lib/utils'
import FetchingNavItemSkeleton from './fetching-nav-item-skeleton'

export function NavBar({ className }: { className: string }) {
  const { projects, resumes, loading } = useNav()
  const isMobile = useIsMobile()
  var projects_section = <FetchingNavItemSkeleton/>
  var resumes_section = <FetchingNavItemSkeleton/>
  
  if (!loading) {
    projects_section = <ul className="max-h-[300px] overflow-y-auto grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                {Object.entries(projects).map(([project_path, project], itemKey) => (
                  <ListItem
                    key={itemKey}
                    title={project.title}
                    to={'/projects/' + project.slug}
                  >
                    {project.nav_description}
                  </ListItem>
                ))}
              </ul>
    resumes_section = <ul className="max-h-[300px] overflow-y-auto grid gap-2 sm:w-[400px] md:w-[400px] md:grid-cols-1 lg:w-[400px]">
                {Object.entries(resumes).map(([_, resume], itemKey) => (
                  <ListItem
                    key={itemKey}
                    title={resume.title}
                    to={resume.path}
                    new_tab={true}
                  >
                    {resume.nav_description}
                  </ListItem>
                ))}
              </ul>
  }

  return (
    <div className={`z-100 fixed top-0 flex w-full h-10 bg-white dark:bg-black justify-between items-center ${className}`}>
      <NavigationMenu className="dark:bg-black">
        <NavigationMenuList className="flex-wrap bg-inherit">
          <NavigationMenuItem className="bg-inherit">
            <NavigationMenuLink {...({ asChild: true } as any)} className="bg-inherit">
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="bg-inherit">
            <NavigationMenuLink {...({ asChild: true } as any)} className="bg-inherit">
              <Link to="/about">About</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
            <NavigationMenuContent className="right-auto left-0">
              {projects_section}
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem className="bg-inherit">
            <NavigationMenuTrigger>Resumes</NavigationMenuTrigger>
            <NavigationMenuContent className="right-auto left-0">
              {resumes_section}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

function ListItem({
  title,
  children,
  to,
  new_tab = false,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { to: string, new_tab?:boolean }) {
  return (
    <li {...props}>
      <NavigationMenuLink {...({ asChild: true } as any)}>
        {(() => {
          if (new_tab) {
            return <a
              href={to}
              target="_blank" 
              rel="noopener noreferrer"
            >
              <div className="text-sm leading-none font-medium">{title}</div>
              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                {children}
              </p>
            </a>
          } else {
            return <Link to={to}>
              <div className="text-sm leading-none font-medium">{title}</div>
              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                {children}
              </p>
            </Link>
          }
        })()}
      </NavigationMenuLink>
    </li>
  )
}
