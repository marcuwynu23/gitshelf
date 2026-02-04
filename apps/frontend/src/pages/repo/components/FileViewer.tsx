import {
  ArrowLeftIcon,
  CodeBracketIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import MonacoEditor from "@monaco-editor/react";
import type {FC} from "react";
import ReactMarkdown from "react-markdown";
import {Button} from "~/components/ui";

type Props = {
  selectedFile: string | null;
  fileContent: Record<string, string>;
  viewMode: "preview" | "raw";
  setViewMode: (m: "preview" | "raw") => void;
  setSelectedFile: (p: string | null) => void;
};

export const FileViewer: FC<Props> = ({
  selectedFile,
  fileContent,
  viewMode,
  setViewMode,
  setSelectedFile,
}) => {
  if (!selectedFile) return null;

  const content = fileContent[selectedFile] || "";
  const isMarkdown = selectedFile.endsWith(".md");

  const getLanguageFromFilename = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
      case "mjs":
      case "cjs":
        return "javascript";
      case "py":
        return "python";
      case "java":
        return "java";
      case "go":
        return "go";
      case "cs":
        return "csharp";
      case "cpp":
      case "cc":
      case "cxx":
        return "cpp";
      case "c":
        return "c";
      case "rs":
        return "rust";
      case "rb":
        return "ruby";
      case "php":
        return "php";
      case "json":
        return "json";
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "html":
      case "htm":
        return "html";
      case "xml":
        return "xml";
      case "sh":
      case "bash":
        return "shell";
      case "yml":
      case "yaml":
        return "yaml";
      case "md":
        return "markdown";
      default:
        return "plaintext";
    }
  };

  const language = isMarkdown
    ? "markdown"
    : getLanguageFromFilename(selectedFile);

  const handleBack = () => {
    setSelectedFile(null);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col">
      <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBack}
            data-testid="fileviewer-back"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="text-xs text-text-tertiary break-all">
            {selectedFile}
          </div>
        </div>

        {isMarkdown && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "preview" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("preview")}
            >
              <EyeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              variant={viewMode === "raw" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("raw")}
            >
              <CodeBracketIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Raw</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-app-surface border border-app-border rounded-lg">
        {isMarkdown ? (
          viewMode === "preview" ? (
            <div className="markdown-body p-6">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full">
              <MonacoEditor
                height="100%"
                language={language}
                theme="vs-dark"
                value={content}
                options={{readOnly: true}}
              />
            </div>
          )
        ) : (
          <div className="h-full">
            <MonacoEditor
              height="100%"
              language={language}
              theme="vs-dark"
              value={content}
              options={{readOnly: true}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
