import PageMeta from "../components/common/PageMeta";
import MetricCards from "../components/rag/MetricCards";
import QueriesChart from "../components/rag/QueriesChart";
import TokenUsageChart from "../components/rag/TokenUsageChart";
import RecentQueries from "../components/rag/RecentQueries";

export default function Dashboard() {
  return (
    <>
      <PageMeta
        title="Dashboard | RagPilot"
        description="Live metrics of your RAG pipeline: indexed documents, queries, chunks and token usage."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <MetricCards />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <QueriesChart />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <TokenUsageChart />
        </div>

        <div className="col-span-12">
          <RecentQueries />
        </div>
      </div>
    </>
  );
}