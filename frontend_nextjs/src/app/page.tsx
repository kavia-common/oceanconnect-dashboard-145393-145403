"use client";

import React from "react";
import SectionCard from "../components/SectionCard";
import ConnectorCard from "../components/ConnectorCard";
import SearchBar from "../components/SearchBar";
import ProjectCard from "../components/ProjectCard";

type JiraProject = { key: string; name: string };
type ConnectorStatus = "connected" | "disconnected";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function Home() {
  // Connector states
  const [jiraStatus, setJiraStatus] = React.useState<ConnectorStatus>("disconnected");
  const [jiraMeta, setJiraMeta] = React.useState<string>("—");

  const [confStatus, setConfStatus] = React.useState<ConnectorStatus>("disconnected");
  const [confMeta, setConfMeta] = React.useState<string>("—");

  // Projects state
  const [projects, setProjects] = React.useState<JiraProject[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState<boolean>(false);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState<string>("");

  // Fetch connector statuses (best-effort; adjust endpoint paths to your backend)
  React.useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const [jiraRes, confRes] = await Promise.allSettled([
          fetch(`${API_BASE}/auth/jira/status`, { cache: "no-store" }),
          fetch(`${API_BASE}/auth/confluence/status`, { cache: "no-store" }),
        ]);

        if (!cancelled) {
          if (jiraRes.status === "fulfilled" && jiraRes.value.ok) {
            const data = await jiraRes.value.json().catch(() => ({}));
            const connected = Boolean(data?.connected ?? data?.is_connected ?? data?.status === "connected");
            setJiraStatus(connected ? "connected" : "disconnected");
            if (typeof data?.projects_count === "number") setJiraMeta(`${data.projects_count} Projects`);
          }

          if (confRes.status === "fulfilled" && confRes.value.ok) {
            const data = await confRes.value.json().catch(() => ({}));
            const connected = Boolean(data?.connected ?? data?.is_connected ?? data?.status === "connected");
            setConfStatus(connected ? "connected" : "disconnected");
            if (typeof data?.spaces_count === "number") setConfMeta(`${data.spaces_count} Spaces`);
          }
        }
      } catch {
        // ignore; UI will reflect disconnected until data proves otherwise
      }
    }

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Jira projects list (and infer jira status if status endpoint unavailable)
  const loadProjects = React.useCallback(
    async (q?: string) => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const url = new URL(`${API_BASE}/jira/projects`);
        if (q && q.trim().length) {
          url.searchParams.set("q", q.trim());
        }
        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to load projects (${res.status})`);
        }
        const data: unknown = await res.json();

        // Type guards and normalizers to avoid `any`
        const isJiraProjectLike = (obj: unknown): obj is { key?: string; code?: string; id?: string; name?: string; title?: string } => {
          if (typeof obj !== "object" || obj === null) return false;
          const o = obj as Record<string, unknown>;
          return typeof o.key === "string" || typeof o.code === "string" || typeof o.id === "string" || typeof o.name === "string" || typeof o.title === "string";
        };

        const normalize = (obj: { key?: string; code?: string; id?: string; name?: string; title?: string }): JiraProject => ({
          key: obj.key ?? obj.code ?? obj.id ?? "?",
          name: obj.name ?? obj.title ?? "Untitled",
        });

        let list: JiraProject[] = [];
        if (Array.isArray(data)) {
          list = data.filter(isJiraProjectLike).map((p) => normalize(p));
        } else if (
          typeof data === "object" &&
          data !== null &&
          Array.isArray((data as { projects?: unknown }).projects as unknown[])
        ) {
          const projectsField = (data as { projects?: unknown }).projects;
          const projectsUnknownArr: unknown[] = Array.isArray(projectsField) ? (projectsField as unknown[]) : [];
          list = projectsUnknownArr.filter(isJiraProjectLike).map((p) => normalize(p));
        }

        setProjects(list);

        // Infer status/meta if not already set by status endpoint
        setJiraStatus("connected");
        setJiraMeta(`${list.length} Projects`);
      } catch (err: unknown) {
        const message =
          typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Unable to load projects";
        setProjectsError(message);
        // Assume disconnected if load fails
        setJiraStatus("disconnected");
        setJiraMeta("Unknown");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    },
    []
  );

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleSearch(value: string) {
    setQuery(value);
    loadProjects(value);
  }

  // Sidebar CTA handlers (wire to OAuth/API token flow endpoints)
  const handleJiraCTA = () => {
    if (jiraStatus === "connected") {
      loadProjects(query);
    } else {
      window.location.href = `${API_BASE}/auth/jira/oauth/start`;
    }
  };

  const handleConfluenceCTA = () => {
    if (confStatus === "connected") {
      window.location.href = `${API_BASE}/confluence/spaces`;
    } else {
      window.location.href = `${API_BASE}/auth/confluence/oauth/start`;
    }
  };

  const renderProjects = () => {
    if (loadingProjects) {
      return (
        <div className="py-8 text-sm text-slate-500" role="status" aria-live="polite">
          Loading projects...
        </div>
      );
    }

    if (projectsError) {
      return (
        <div className="py-8">
          <div className="text-sm text-red-600">Error: {projectsError}</div>
          <button
            type="button"
            onClick={() => loadProjects(query)}
            className="mt-3 h-9 px-4 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!projects.length) {
      return (
        <div className="py-10 text-center text-sm text-slate-500">
          {query ? "No projects match your search." : "No projects found. Connect JIRA to get started."}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <ProjectCard key={`${p.key}-${p.name}`} code={p.key} title={p.name} />
        ))}
      </div>
    );
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <aside className="bg-white rounded-lg shadow-md p-4" aria-label="Available connectors">
          <h2 className="text-base font-semibold mb-3">Available Connectors</h2>
          <div className="space-y-4">
            <ConnectorCard
              name="JIRA"
              status={jiraStatus}
              meta={jiraMeta}
              description="Connect to Atlassian JIRA to manage projects and issues"
              cta={{ label: jiraStatus === "connected" ? "Refresh" : "Connect", onClick: handleJiraCTA, ariaLabel: "Jira connector action" }}
            />
            <ConnectorCard
              name="Confluence"
              status={confStatus}
              meta={confMeta}
              description="Connect to Atlassian Confluence to manage content"
              cta={{
                label: confStatus === "connected" ? "Open" : "Connect",
                onClick: handleConfluenceCTA,
                ariaLabel: "Confluence connector action",
              }}
            />
          </div>
        </aside>

        <SectionCard
          title="JIRA Projects"
          actionsSlot={<SearchBar value={query} placeholder="Search projects..." onSubmit={handleSearch} buttonLabel="Search" />}
        >
          {renderProjects()}
        </SectionCard>
      </div>
    </main>
  );
}
