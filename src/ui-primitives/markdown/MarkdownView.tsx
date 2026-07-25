import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parse as parseFrontmatter } from '@/adapters/frontmatter'
import { remarkAlerts } from './alerts'
import { CodeBlock } from './CodeBlock'
import { FrontmatterPanel } from './FrontmatterPanel'
import { ExternalLink } from '../ExternalLink'

interface Props {
  value: string
}

// Hoisted so identity is stable across re-renders. Inline functions here
// would remount every CodeBlock on each parent render, wiping Shiki state.
const PLUGINS = [remarkGfm, remarkAlerts]

const COMPONENTS: Components = {
  a: ({ href, children }) => {
    if (!href) return <>{children}</>
    return <ExternalLink target={href}>{children}</ExternalLink>
  },
  img: ({ src, alt }) => {
    if (typeof src === 'string' && /^https?:\/\//i.test(src)) {
      return (
        <span className="remote-media-blocked">
          Remote image blocked: {alt || src}
        </span>
      )
    }
    return <img src={src} alt={alt ?? ''} loading="lazy" />
  },
  pre: ({ children }) => <>{children}</>,
  code({ className, children, ...rest }) {
    const match = /language-(\w+)/.exec(className ?? '')
    if (match) {
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, '')}
          lang={match[1] ?? 'text'}
        />
      )
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    )
  },
}

export function MarkdownView({ value }: Props) {
  const { data, body, hadFrontmatter } = parseFrontmatter(value)
  return (
    <>
      {hadFrontmatter && <FrontmatterPanel data={data} />}
      <ReactMarkdown remarkPlugins={PLUGINS} components={COMPONENTS}>
        {body}
      </ReactMarkdown>
    </>
  )
}
