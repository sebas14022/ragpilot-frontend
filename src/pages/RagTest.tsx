import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import UploadPanel from "../components/rag/UploadPanel";
import ChatPanel from "../components/rag/ChatPanel";

export default function RagTest() {
  const [indexedCount, setIndexedCount] = useState(0);

  return (
    <>
      <PageMeta
        title="Test RAG | RagPilot"
        description="Upload documents and test your RAG pipeline with chat queries."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-5">
          <UploadPanel
            onIndexedChange={(delta) =>
              setIndexedCount((prev) => Math.max(0, prev + delta))
            }
          />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <ChatPanel indexedCount={indexedCount} />
        </div>
      </div>
    </>
  );
}