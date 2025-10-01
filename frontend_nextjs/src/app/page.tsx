"use client";

import SectionCard from "../components/SectionCard";
import ConnectorCard from "../components/ConnectorCard";
import SearchBar from "../components/SearchBar";
import ProjectCard from "../components/ProjectCard";

type Project = { code: string; title: string };

const mockProjects: Project[] = [
  { code: "GTS", title: "Go to market sample" },
  { code: "KANB", title: "My Kanban Project" },
  { code: "DEV", title: "Kanla Development" },
  { code: "UX", title: "Kanla UX" },
  { code: "MYD", title: "My discovery project" },
  { code: "WFM", title: "WFM" },
  { code: "WF", title: "Workflow Manager" },
];

export default function Home() {
  function handleSearch(value: string) {
    // For now just log; in future wire to backend filtering.
    console.log("Search:", value);
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <aside className="bg-white rounded-lg shadow-md p-4" aria-label="Available connectors">
          <h2 className="text-base font-semibold mb-3">Available Connectors</h2>
          <div className="space-y-4">
            <ConnectorCard
              name="JIRA"
              status="connected"
              meta="10 Projects"
              description="Connect to Atlassian JIRA to manage projects and issues"
              cta={{ label: "View" }}
            />
            <ConnectorCard
              name="Confluence"
              status="disconnected"
              meta="Unknown"
              description="Connect to Atlassian Confluence to manage content"
              cta={{ label: "Connect" }}
            />
          </div>
        </aside>

        <SectionCard
          title="JIRA Projects"
          actionsSlot={<SearchBar value="" placeholder="Search projects..." onSubmit={handleSearch} buttonLabel="Search" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProjects.map((p) => (
              <ProjectCard key={p.title} code={p.code} title={p.title} />
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
