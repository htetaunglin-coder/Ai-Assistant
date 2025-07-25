import { cn } from "@mijn-ui/react-theme"
import ReactMarkdown, { type Components } from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import remarkGfm from "remark-gfm"

const components: Partial<Components> = {
  code({ node: _, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "")

    return !inline && match ? (
      <SyntaxHighlighter
        lineProps={{
          style: { wordBreak: "break-all", whiteSpace: "pre-wrap" },
        }}
        codeTagProps={{
          style: { display: "block", width: "50%" },
        }}
        customStyle={{
          borderRadius: "0.75rem",
          fontSize: "0.75rem",
        }}
        style={a11yDark}
        PreTag={(props) => <div className="max-w-[calc(100vw-32px)] md:max-w-none" {...props} />}
        language={match[1]}
        {...props}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={cn("rounded-md bg-neutral-300 px-1 py-0.5 text-sm dark:bg-neutral-800", className)} {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => <pre className="my-4 w-full">{children}</pre>,
  ol: ({ node: _, children, ...props }) => {
    return (
      <ol className="ml-4 list-outside list-decimal py-1.5" {...props}>
        {children}
      </ol>
    )
  },
  li: ({ node: _, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    )
  },
  ul: ({ node: _, children, ...props }) => {
    return (
      <ul className="ml-4 list-outside list-decimal" {...props}>
        {children}
      </ul>
    )
  },
  strong: ({ node: _, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    )
  },
  a: ({ node: _, children, ...props }) => {
    return (
      <a className="text-primary hover:underline" target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    )
  },
  p: ({ node: _, children, ...props }) => {
    return (
      <p className="my-1" {...props}>
        {children}
      </p>
    )
  },
  h1: ({ node: _, children, ...props }) => {
    return (
      <h1 className="mb-2 mt-4 text-2xl font-semibold sm:text-3xl" {...props}>
        {children}
      </h1>
    )
  },
  h2: ({ node: _, children, ...props }) => {
    return (
      <h2 className="mb-2 mt-4 text-xl font-semibold sm:text-2xl" {...props}>
        {children}
      </h2>
    )
  },
  h3: ({ node: _, children, ...props }) => {
    return (
      <h3 className="mb-2 mt-4 text-lg font-semibold sm:text-xl" {...props}>
        {children}
      </h3>
    )
  },
  h4: ({ node: _, children, ...props }) => {
    return (
      <h4 className="text-md mb-2 mt-4 font-semibold sm:text-lg" {...props}>
        {children}
      </h4>
    )
  },
  h5: ({ node: _, children, ...props }) => {
    return (
      <h5 className="mb-2 mt-4 text-base font-semibold" {...props}>
        {children}
      </h5>
    )
  },
  h6: ({ node: _, children, ...props }) => {
    return (
      <h6 className="mb-2 mt-4 text-sm font-semibold" {...props}>
        {children}
      </h6>
    )
  },
}

const remarkPlugins = [remarkGfm]

const Markdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  )
}

export { Markdown }
