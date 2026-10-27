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
    }
  }, []);

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
        onChanged?.();
      }
    },
    [refresh, onChanged],
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
      onChanged?.();
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <header className="flex items-center justify-between pb-4">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white/90">
            Knowledge base
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {indexedTotal} / {entries.length} ready · PDF, MD, TXT, JSON, CSV
          </p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Max {MAX_DOCUMENT_SIZE / 1024} KB
        </span>
      </header>

      {error && (
        <div className="mb-4 rounded-lg bg-error-50 p-3 text-xs text-error-600 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive
            ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10"
            : "border-gray-200 hover:border-brand-500 dark:border-gray-800 dark:hover:border-brand-500"
        }`}
      >
        <input {...getInputProps()} />
        <FileIcon className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isDragActive ? "Drop here" : "Drag files or click to upload"}
        </p>
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
          Must fit within the {MAX_DOCUMENT_SIZE / 1024} KB token budget
        </p>
      </div>

      {pendingNames.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {pendingNames.map((name) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:bg-gray-800/50"
            >
              <span className="truncate">{name}</span>
              <span className="animate-pulse text-brand-600 dark:text-brand-400">
                processing...
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
        {loading && entries.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-400">
            Loading documents...
          </p>
        )}
        {!loading && entries.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-400">
            No documents yet. Upload a sample to start comparing.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between py-2.5 text-xs"
          >
            <label className="flex min-w-0 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(entry.id)}
                onChange={() => toggleSelect(entry.id)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="truncate text-gray-800 dark:text-white/90">
                {entry.filename}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <Badge
                size="sm"
                color={
                  entry.status === "indexed"
                    ? "success"
                    : entry.status === "failed"
                      ? "error"
                      : "warning"
                }
              >
                {entry.status}
              </Badge>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                className="text-gray-400 transition-colors hover:text-error-500"
                aria-label={`Delete ${entry.filename}`}
              >
                <TrashBinIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
