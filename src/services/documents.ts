import { api } from "../lib/api";
import type { DocumentList, DocumentSummary, UploadResult } from "../lib/types";

export async function listDocuments(): Promise<DocumentList> {
  return api.get<DocumentList>("/v1/documents");
}

export async function uploadDocument(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  return api.post<UploadResult>("/v1/documents", undefined, {
    formData,
    timeoutMs: 90_000,
  });
}

export async function deleteDocument(id: string): Promise<void> {
  return api.post<void>(`/v1/documents/${id}/delete`);
}

export type { DocumentSummary };