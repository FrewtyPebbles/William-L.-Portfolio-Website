import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Roboto, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { Project } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import {  } from 'next/font/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ['latin'],
  weight: ['400', '700']
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ['latin'],
  display: 'swap',
});

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk', // 2. Assign a CSS variable name
  display: 'swap',
});

export const metadata: Metadata = {
  title: "William L.",
  description: "William L's projects and resume",
};

async function get_projects():Promise<Project[]> {
  const projects = await prisma.project.findMany()
  return projects;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const projects = await get_projects();
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body
        className={`${montserrat.className} ${montserrat.variable} antialiased`}
      >
        <script>
          { // hack for SEO with SSR dark mode for tailwindcss v4.1
            "if (window.matchMedia('(prefers-color-scheme: dark)').matches) {" +
            "document.documentElement.classList.add('dark');" +
            "}"
          }
        </script>
        <div className="flex flex-col h-min-screen">
          <div className="h-10"/>
          <NavBar projects={projects} className=""/>
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
