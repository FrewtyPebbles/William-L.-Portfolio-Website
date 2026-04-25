import type { MDXComponents } from 'mdx/types'
import { get_asset_url } from './lib/utils';

// This function is required to use MDX with the App Router
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className='text-3xl pl-1.75 pr-1.75 p-2'>{children}</h1>
    ),

    h2: ({ children }) => (
      <h2 className='text-2xl pl-1.75 pr-1.75 p-1'>{children}</h2>
    ),

    h3: ({ children }) => (
      <h3 className='text-xl pl-1.75 pr-1.75 p-1'>{children}</h3>
    ),

    p: ({ children }) => (
        <p className='text-5 p-2 pl-4 pr-4'>
            {children}
        </p>
    ),

    em: ({ children }) => (
      <em className='text-6'>{children}</em>
    ),

    a: ({ href, children, ...props}) => (
        <span className=''>
            <a className='
                transition duration-300
                pl-1 pr-1 hover:text-white
                text-blue-300 hover:bg-blue-400/40
                hover:cursor-pointer rounded-sm
            ' href={href}
            {...props}
            >{children}</a>
        </span>
    ),
    
    img: (props) => (
      <span className="relative block w-full aspect-video my-4">
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src={get_asset_url(props.src)}
            alt={props.alt || "image"}
            {...props}
            className={`object-contain ${props.className || ''}`}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              objectFit: 'contain', // Replaces object-contain class behavior
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

    // 2. Handle the code text (works for both inline and blocks)
    code: ({ children }) => (
      <code className="font-mono text-sm">
        {children}
      </code>
    ),

    blockquote: ({children}) => (
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

    ul: ({children}) => (
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

    ...components, // Merge with existing components
  }
}