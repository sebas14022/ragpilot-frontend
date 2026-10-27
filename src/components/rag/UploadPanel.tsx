import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileIcon, TrashBinIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
} from "../../services/documents";
import type { DocumentSummary } from "../../lib/types";

type Entry = DocumentSummary;

const acceptedTypes = {
  "application/pdf": [".pdf"],
  "text/markdown": [".md"],
  "text/plain": [".txt"],
  "application/json": [".json"],
  "text/csv": [".csv"],
};

// The full-doc baseline stuffs the whole document into one prompt, so files must
// fit the LLM token budget (~6K tokens). The backend enforces 24,000 characters
// of extracted text; this byte guard only catches obvious oversized uploads
// before they hit the network.
const MAX_DOCUMENT_SIZE = 24 * 1024;

export default function UploadPanel({
  selectedIds,
  onSelectedIdsChange,
  onChanged,
}: {
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onChanged?: () => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingNames, setPendingNames] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await listDocuments();
      setEntries(data.documents);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load documents");
    } finally {
      setLoading(false);
      onChanged?.();
    }
  }, [onChanged]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const tooLarge = acceptedFiles.filter((f) => f.size > MAX_DOCUMENT_SIZE);
      if (tooLarge.length > 0) {
        setError(
          `"${tooLarge.map((f) => f.name).join(", ")}" exceeds the ${MAX_DOCUMENT_SIZE / 1024} KB limit. The full-doc baseline fits the whole document in one prompt, so it must stay under the token budget.`,
        );
        return;
      }

      setPendingNames((prev) => [...prev, ...acceptedFiles.map((f) => f.name)]);
      setError(null);
      try {
        for (const file of acceptedFiles) {
          await uploadDocument(file);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setPendingNames((prev) =>
          prev.filter(
            (n) => !acceptedFiles.some((f) => f.name === n),
          ),
        );
        await refresh();
      }
    },
    [refresh],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize: MAX_DOCUMENT_SIZE,
  });

  const remove = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    onSelectedIdsChange(selectedIds.filter((s) => s !== id));
    try {
      await deleteDocument(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      await refresh();
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((s) => s !== id));
    } else {
      onSelectedIdsChange([...selectedIds, id]);
    }
  };

  const indexedTotal = entries.filter(
    (e) => e.status === "indexed",
  ).length;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Knowledge base
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload documents and select the ones to query against.
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
              d="M11.4697 2.46967C11.7626 2.17678 12.2374 2.17678 12.5303 2.46967L17.0303 6.96967C17.3232 7.26256 17.3232 7.73744 17.0303 8.03033C16.7374 8.32322 16.2626 8.32322 15.9697 8.03033L12.75 4.81066V15C12.75 15.4142 12.4142 15.75 12 15.75C11.5858 15.75 11.25 15.4142 11.25 15V4.81066L8.03033 8.03033C7.73744 8.32322 7.26256 8.32322 6.96967 8.03033L11.4697 2.46967ZM5.75 12.25C5.75 11.8358 5.41421 11.5 5 11.5C4.58579 11.5 4.25 11.8358 4.25 12.25V19C4.25 20.2426 5.25736 21.25 6.5 21.25H17.5C18.7426 21.25 19.75 20.2426 19.75 19V12.25C19.75 11.8358 19.4142 11.5 19 11.5C18.5858 11.5 18.25 11.8358 18.25 12.25V19C18.25 19.4142 17.9142 19.75 17.5 19.75H6.5C6.41421 19.75 5.75 19.0858 5.75 19V12.25Z"
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
            or click to browse - PDF, MD, TXT, JSON, CSV. Max 24,000 characters
            each.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedIds.length > 0
            ? `${selectedIds.length} selected for query`
            : loading
              ? "Loading..."
              : indexedTotal > 0
                ? "Select documents to query"
                : "No documents indexed yet"}
        </span>
        {indexedTotal > 0 && !loading && (
          <Badge color="success" size="sm">
            {indexedTotal} ready
          </Badge>
        )}
      </div>

      {(entries.length > 0 || pendingNames.length > 0) && (
        <ul className="flex flex-col gap-2">
          {pendingNames.map((name) => (
            <li
              key={`pending-${name}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <FileIcon className="size-5 shrink-0 text-brand-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {name}
                </p>
              </div>
              <Badge color="warning" size="sm">
                Indexing
              </Badge>
            </li>
          ))}
          {entries.map((entry) => {
            const selectable = entry.status === "indexed";
            const selected = selectedIds.includes(entry.id);
            return (
              <li
                key={entry.id}
                onClick={selectable ? () => toggleSelect(entry.id) : undefined}
                className={`flex items-center gap-3 rounded-lg border p-3 dark:border-gray-800 dark:bg-white/[0.03] ${
                  selectable
                    ? `cursor-pointer border-gray-200 bg-gray-50 transition-colors ${
                        selected
                          ? "border-brand-300 ring-1 ring-brand-300 dark:border-brand-700"
                          : "hover:border-brand-300 dark:hover:border-brand-700"
                      }`
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    selected
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  {selected && (
                    <svg
                      className="fill-current"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.7071 5.29289c.3905.39053.3905 1.02369 0 1.41422l-9 9c-.3905.3905-1.0237.3905-1.4142 0l-5-5c-.39053-.39053-.39053-1.02369 0-1.41422.39052-.39052 1.02369-.39052 1.41421 0L10 14.5858l8.29289-8.29291c.39053-.39052 1.02369-.39052 1.41421 0Z"
                      />
                    </svg>
                  )}
                </span>
                <FileIcon className="size-5 shrink-0 text-brand-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                    {entry.filename}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.chunks} chunks · {entry.status}
                  </p>
                </div>
                {entry.status === "processing" ? (
                  <Badge color="warning" size="sm">
                    Indexing
                  </Badge>
                ) : entry.status === "failed" ? (
                  <Badge color="error" size="sm">
                    Failed
                  </Badge>
                ) : (
                  <Badge color={selected ? "primary" : "light"} size="sm">
                    {selected ? "Selected" : "Select"}
                  </Badge>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(entry.id);
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-error-500 dark:hover:bg-gray-700"
                  aria-label={`Remove ${entry.filename}`}
                >
                  <TrashBinIcon className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
