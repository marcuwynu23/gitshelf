import type {FC} from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/esm/styles/prism";
import {useThemeStore} from "~/stores/themeStore";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({content}) => {
  const theme = useThemeStore((s) => s.theme);

  const isDark = (() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true;
  })();

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        code({className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");

          if (match) {
            return (
              <SyntaxHighlighter
                style={isDark ? oneDark : undefined}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: "6px",
                  fontSize: "13px",
                  ...(isDark
                    ? {}
                    : {
                        background: "#f6f8fa",
                        border: "1px solid #e2e8f0",
                      }),
                }}
              >
                {codeString}
              </SyntaxHighlighter>
            );
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
