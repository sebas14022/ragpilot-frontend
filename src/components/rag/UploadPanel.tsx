import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileIcon, TrashBinIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

type FileStatus = "indexing" | "indexed";

type DocumentFile = {
  id: string;
  name: string;
  size: number;
  status: FileStatus;
};

const acceptedTypes = {
  "application/pdf": [".pdf"],
  "text/markdown": [".md"],
  "text/plain": [".txt"],
  "application/json": [".json"],
  "text/csv": [".csv"],
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPanel({
  onIndexedChange,
}: {
  onIndexedChange: (delta: number) => void;
}) {
  const [files, setFiles] = useState<DocumentFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const next: DocumentFile[] = acceptedFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        size: file.size,
        status: "indexing" as FileStatus,
      }));

      setFiles((prev) => [...prev, ...next]);
      onIndexedChange(next.length);

      next.forEach((doc) => {
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === doc.id ? { ...f, status: "indexed" as FileStatus } : f,
            ),
          );
        }, 1500);
      });
    },
    [onIndexedChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    onIndexedChange(-1);
  };

  const indexedTotal = useMemo(
    () => files.filter((f) => f.status === "indexed").length,
    [files],
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Upload documents
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add knowledge sources to the index before asking questions.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-colors ${
          isDragActive
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : "border-gray-300 hover:border-brand-400 dark:border-gray-700"
        }`}
      >
        <input {...getInputProps()} />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg
            className="fill-gray-500 dark:fill-gray-400"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.4697 2.46967C11.7626 2.17678 12.2374 2.17678 12.5303 2.46967L17.0303 6.96967C17.3232 7.26256 17.3232 7.73744 17.0303 8.03033C16.7374 8.32322 16.2626 8.32322 15.9697 8.03033L12.75 4.81066V15C12.75 15.4142 12.4142 15.75 12 15.75C11.5858 15.75 11.25 15.4142 11.25 15V4.81066L8.03033 8.03033C7.73744 8.32322 7.26256 8.32322 6.96967 8.03033C6.67678 7.73744 6.67678 7.26256 6.96967 6.96967L11.4697 2.46967ZM5.75 12.25C5.75 11.8358 5.41421 11.5 5 11.5C4.58579 11.5 4.25 11.8358 4.25 12.25V19C4.25 20.2426 5.25736 21.25 6.5 21.25H17.5C18.7426 21.25 19.75 20.2426 19.75 19V12.25C19.75 11.8358 19.4142 11.5 19 11.5C18.5858 11.5 18.25 11.8358 18.25 12.25V19C18.25 19.4142 17.9142 19.75 17.5 19.75H6.5C6.08579 19.75 5.75 19.4142 5.75 19V12.25Z"
              fill=""
            />
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragActive
              ? "Drop the files here"
              : "Drag & drop your documents here"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            or click to browse - PDF, MD, TXT, JSON, CSV. Max 10 MB each.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {indexedTotal > 0
            ? `${indexedTotal} file${indexedTotal > 1 ? "s" : ""} indexed`
            : "No documents indexed yet"}
        </span>
        {indexedTotal > 0 && (
          <Badge color="success" size="sm">
            {indexedTotal} ready
          </Badge>
        )}
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <FileIcon className="size-5 shrink-0 text-brand-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatBytes(file.size)}
                </p>
              </div>
              {file.status === "indexing" ? (
                <Badge color="warning" size="sm">
                  Indexing
                </Badge>
              ) : (
                <Badge color="success" size="sm">
                  Indexed
                </Badge>
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-error-500 dark:hover:bg-gray-700"
                aria-label={`Remove ${file.name}`}
              >
                <TrashBinIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}