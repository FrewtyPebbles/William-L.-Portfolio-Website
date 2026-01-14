"use client"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport
} from "@/components/ui/navigation-menu"
import { Project } from "@/generated/prisma";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";

// TODO: Dropdown data should come from database

export function NavBar({projects, className} : {projects:Project[], className:string}) {
    const isMobile:boolean = useIsMobile();

    return (
        <div className={`fixed top-0 flex w-full h-10 bg-white dark:bg-black justify-between items-center ${className}`}>
          <NavigationMenu viewport={isMobile} className="dark:bg-black">
            <NavigationMenuList className="flex-wrap bg-inherit">
                <NavigationMenuItem className="bg-inherit">
                    <NavigationMenuLink asChild className="bg-inherit">
                        <Link href="/">Home</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
                  <NavigationMenuContent className="right-auto left-0">
                    <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                      {/* PROJECTS */}
                      {projects.map((project:Project, itemKey:number) => (
                        <ListItem
                          key={itemKey}
                          title={project.title}
                          href={project.slug}
                        >
                          {project.nav_description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              <NavigationMenuItem className="bg-inherit">
                <NavigationMenuTrigger>Resumes</NavigationMenuTrigger>
                <NavigationMenuContent className="right-auto left-0">
                  <ul className="grid gap-2 sm:w-[400px] md:w-[400px] md:grid-cols-1 lg:w-[400px]">
                    {/* RESUMES */}
                    <ListItem
                      title={"General Software Engineering"}
                      href={"/resume.pdf"}
                    >
                      This resume describes my software engineering related skills and best projects.
                    </ListItem>
                  </ul>
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
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}