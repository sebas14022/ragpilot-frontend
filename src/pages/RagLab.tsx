import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import UploadPanel from "../components/rag/UploadPanel";
import RagLabChat from "../components/rag/RagLabChat";
import RagLabHistory from "../components/rag/RagLabHistory";
import RecentQueries from "../components/rag/RecentQueries";

export default function RagLab() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <PageMeta
        title="RAG Lab | RagPilot"
        description="Upload documents, compare RAG against a baseline, and inspect live and persisted analytics in a single workspace."
      />

      <RagLabHistory refreshKey={refreshKey} />

      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-4">
          <UploadPanel
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onChanged={refresh}
          />
        </div>
        <div className="col-span-12 xl:col-span-8">
          <RagLabChat selectedIds={selectedIds} onResult={refresh} />
        </div>
      </div>

      <div className="mt-6">
        <RecentQueries refreshKey={refreshKey} />
      </div>
    </>
  );
}
