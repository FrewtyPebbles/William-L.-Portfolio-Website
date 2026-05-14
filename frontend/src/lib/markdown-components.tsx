import type { Components } from 'react-markdown'
import { get_asset_url } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { JSX, ReactNode } from 'react'
import React from 'react'


function extractText(node: ReactNode): string {
  if (!node) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  
  // Explicitly check validity and cast type safely to read .props
  if (React.isValidElement(node)) {
    const props = node.props as { children?: ReactNode }
    if (props.children) {
      return extractText(props.children)
    }
  }
  return ''
}

interface TitleHrefProps {
  title: ReactNode
  element: JSX.Element
}

function TitleHref({ title, element }: TitleHrefProps) {
  const cleanSlug = encodeURIComponent(
    extractText(title).trim().toLowerCase().replace(/\s+/g, '-')
  )

  const id = cleanSlug
  const href = `#${cleanSlug}`
  const baseClassName = element.props.className || ''

  // Safe execution inside a functional component body
  return React.cloneElement(element, {
    id,
    className: `${baseClassName} group/heading relative flex items-center scroll-mt-20`,
    children: (
      <>
        {element.props.children}
        <a 
          href={href} 
          className="opacity-0 group-hover/heading:opacity-50 hover:opacity-100 transition-opacity pr-2 text-gray-400 hover:text-blue-500 font-normal select-none"
          aria-label={`Link to ${extractText(title)}`}
        >
          🔗
        </a>
      </>
    )
  })
}

// Define your elements using the react-markdown Components type
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <TitleHref 
      title={children} 
      element={<h1 className='text-3xl pl-1.75 pr-1.75 p-2'>{children}</h1>} 
    />
  ),

  h2: ({ children }) => (
    <TitleHref 
      title={children} 
      element={<h2 className='text-2xl pl-1.75 pr-1.75 p-1'>{children}</h2>} 
    />
  ),

  h3: ({ children }) => (
    <TitleHref 
      title={children} 
      element={<h3 className='text-xl pl-1.75 pr-1.75 p-1'>{children}</h3>} 
    />
  ),

  p: ({ children }) => (
    <p className='text-5 p-2 pl-4 pr-4'>{children}</p>
  ),

  em: ({ children }) => (
    <em className='text-6'>{children}</em>
  ),

  a: ({ href, children, ...props }) => (
    <span>
      <a className='
          transition duration-300
          pl-1 pr-1 hover:text-white
          text-blue-300 hover:bg-blue-400/40
          hover:cursor-pointer rounded-sm
        ' 
        href={href}
        {...props}
      >
        {children}
      </a>
    </span>
  ),
  
  img: ({ src, alt, ...props }) => (
    <span className="relative block w-full aspect-video my-4">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={src !== undefined ? get_asset_url(src) : undefined}
          alt={alt || "image"}
          {...props}
          className={`object-contain ${props.className || ''}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            objectFit: 'contain',
            ...props.style
          }}
        />
      </div>
    </span>
  ),

  pre: ({ children }) => (
    <pre className="
      dark:bg-gray-900
      dark:text-white
      bg-gray-200
      text-black
      w-[calc(100%_-_var(--spacing)_*_4)]
      m-2
      p-4
      rounded-md
      overflow-x-auto
    ">
      {children}
    </pre>
  ),

  code: ({ node, className, children, ...props }) => {
    // Extract language identifier (e.g. language-js -> js)
    const match = /language-(\w+)/.exec(className || '')    
    const inline = !match

    if (inline) {
      // Return simple inline code styling if there's no code block language block
      return (
        <code className="font-mono text-sm bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
          {children}
        </code>
      )
    }

    const { style, ref, ...cleanProps } = props;

    return (
      <SyntaxHighlighter
        language={match[1]}
        style={vscDarkPlus}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: 'transparent',
          padding: '0.75rem',
        }}
        {...cleanProps}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    )
  },

  blockquote: ({ children }) => (
    <blockquote className='
      dark:bg-gray-700
      dark:border-gray-600
      bg-gray-300
      border-gray-400
      border-l-8
      border-solid
    '>
      {children}
    </blockquote>
  ),

  hr: () => (
    <hr className='
        h-1
        bg-radial
        dark:from-white/50
        dark:to-transparent
        to-transparent
        from-black/50
        m-3
        w-[calc(100%_-_var(--spacing)_*_6)]
        border-none
      ' />
  ),

  ul: ({ children }) => (
    <ul className='list-disc list-inside p-3 flex flex-col gap-1'>
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className='list-decimal list-inside p-3 flex flex-col gap-3'>
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className='pl-2'>
      {children}
    </li>
  ),
  
  table: ({ children }) => (
    <div className="w-full my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
      {children}
    </thead>
  ),

  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-black">
      {children}
    </tbody>
  ),

  tr: ({ children }) => (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
      {children}
    </tr>
  ),

  th: ({ children }) => (
    <th className="p-4 border-b border-gray-200 dark:border-gray-800">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="p-4 text-gray-600 dark:text-gray-400">
      {children}
    </td>
  ),
}
