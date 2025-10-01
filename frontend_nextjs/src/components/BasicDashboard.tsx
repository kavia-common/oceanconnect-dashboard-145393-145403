"use client";

import React from "react";
import SectionCard from "./SectionCard";
import ConnectorCard from "./ConnectorCard";
import SearchBar from "./SearchBar";
import ProjectCard from "./ProjectCard";
import TokenModal from "./TokenModal";
import { useToast } from "./ToastProvider";
import { apiGet, getApiBase } from "../lib/api";

type JiraProject = { key: string; name: string };
type ConnectorStatus = "connected" | "disconnected" | "connecting";

const API_BASE = getApiBase();

// PUBLIC_INTERFACE
/**
 * BasicDashboard provides a simplified dashboard without complex animations
 * to avoid SSR issues while maintaining all functionality.
 */
export default function BasicDashboard() {
  const { showSuccess, showError, showInfo } = useToast();

  // Connector states
  const [jiraStatus, setJiraStatus] = React.useState<ConnectorStatus>("disconnected");
  const [jiraMeta, setJiraMeta] = React.useState<string>("—");
  const [jiraLoading, setJiraLoading] = React.useState(false);

  const [confStatus, setConfStatus] = React.useState<ConnectorStatus>("disconnected");
  const [confMeta, setConfMeta] = React.useState<string>("—");
  const [confLoading, setConfLoading] = React.useState(false);

  // Token modal visibility
  const [showJiraToken, setShowJiraToken] = React.useState(false);
  const [showConfToken, setShowConfToken] = React.useState(false);

  // Projects state
  const [projects, setProjects] = React.useState<JiraProject[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState<boolean>(false);
  const [loadingStatuses, setLoadingStatuses] = React.useState<boolean>(true);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState<string>("");

  // Fetch connector statuses
  const fetchStatuses = React.useCallback(async () => {
    setLoadingStatuses(true);
    try {
      const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);

      const [jira, conf] = await Promise.allSettled([
        apiGet<unknown>(`/status?session_id=${sessionId}`),
        apiGet<unknown>(`/status?session_id=${sessionId}`),
      ]);

      if (jira.status === "fulfilled") {
        const data = jira.value as Record<string, unknown>;
        const jiraConnected = Boolean(data?.jira_connected);
        setJiraStatus(jiraConnected ? "connected" : "disconnected");
        if (typeof data?.projects_count === "number") {
          setJiraMeta(`${data.projects_count as number} Projects`);
        } else if (jiraConnected) {
          setJiraMeta("Connected");
        } else {
          setJiraMeta("—");
        }
      }

      if (conf.status === "fulfilled") {
        const data = conf.value as Record<string, unknown>;
        const confConnected = Boolean(data?.confluence_connected);
        setConfStatus(confConnected ? "connected" : "disconnected");
        if (typeof data?.spaces_count === "number") {
          setConfMeta(`${data.spaces_count as number} Spaces`);
        } else if (confConnected) {
          setConfMeta("Connected");
        } else {
          setConfMeta("—");
        }
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      showError('Failed to fetch connection status');
    } finally {
      setLoadingStatuses(false);
    }
  }, [showError]);

  React.useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Fetch Jira projects list
  const loadProjects = React.useCallback(
    async (q?: string) => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
        const url = new URL(`${API_BASE}/jira/projects`);
        url.searchParams.set("session_id", sessionId);
        if (q && q.trim().length) {
          url.searchParams.set("q", q.trim());
        }
        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Please connect to Jira first to view projects");
          }
          throw new Error(`Failed to load projects (${res.status})`);
        }
        const data: unknown = await res.json();

        // Type guards and normalizers
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

        if (jiraStatus !== "connected") {
          setJiraStatus("connected");
          setJiraMeta(`${list.length} Projects`);
          showSuccess(`Loaded ${list.length} Jira projects`);
        }
      } catch (err: unknown) {
        const message =
          typeof err === "object" && err !== null && "message" in err && typeof (err as { message: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Unable to load projects";
        setProjectsError(message);
        setProjects([]);
        
        if (message.includes("connect to Jira")) {
          showInfo(message);
        } else {
          showError(`Failed to load projects: ${message}`);
        }
      } finally {
        setLoadingProjects(false);
      }
    },
    [jiraStatus, showSuccess, showError, showInfo]
  );

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleSearch(value: string) {
    setQuery(value);
    loadProjects(value);
  }

  const handleJiraCTA = () => {
    if (jiraStatus === "connected") {
      loadProjects(query);
    } else {
      // Simple OAuth start without complex error handling for basic version
      window.location.href = `${API_BASE}/auth/jira/oauth/start`;
    }
  };

  const handleConfluenceCTA = () => {
    if (confStatus === "connected") {
      const sessionId = localStorage.getItem('sessionId');
      const url = `${API_BASE}/confluence/spaces?session_id=${sessionId}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `${API_BASE}/auth/confluence/oauth/start`;
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <aside
          className="bg-white rounded-lg shadow-md p-4 h-fit"
          aria-label="Available connectors"
        >
          <h2 className="text-base font-semibold mb-4 text-[var(--text-primary)]">
            Available Connectors
          </h2>
          
          {loadingStatuses ? (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ConnectorCard
                name="JIRA"
                status={jiraStatus}
                meta={jiraMeta}
                description="Connect to Atlassian JIRA to manage projects and issues"
                loading={jiraLoading}
                cta={{ 
                  label: jiraStatus === "connected" ? "Refresh" : "Connect", 
                  onClick: handleJiraCTA, 
                  ariaLabel: "Jira connector action",
                  loading: jiraLoading
                }}
                secondaryCta={{
                  label: "Use API Token",
                  onClick: () => setShowJiraToken(true),
                  ariaLabel: "Connect Jira using API Token",
                }}
              />
              <ConnectorCard
                name="Confluence"
                status={confStatus}
                meta={confMeta}
                description="Connect to Atlassian Confluence to manage content"
                loading={confLoading}
                cta={{
                  label: confStatus === "connected" ? "View Spaces" : "Connect",
                  onClick: handleConfluenceCTA,
                  ariaLabel: "Confluence connector action",
                  loading: confLoading
                }}
                secondaryCta={{
                  label: "Use API Token",
                  onClick: () => setShowConfToken(true),
                  ariaLabel: "Connect Confluence using API Token",
                }}
              />
            </div>
          )}
        </aside>

        <div>
          <SectionCard
            title="JIRA Projects"
            actionsSlot={
              <SearchBar 
                value={query} 
                placeholder="Search projects..." 
                onSubmit={handleSearch} 
                buttonLabel="Search"
                disabled={loadingProjects || jiraStatus === "disconnected"}
              />
            }
          >
            {loadingProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projectsError ? (
              <div className="py-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Unable to Load Projects</h3>
                  <p className="text-sm text-red-600 mb-4">{projectsError}</p>
                  <button
                    type="button"
                    onClick={() => loadProjects(query)}
                    className="h-9 px-4 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : !projects.length ? (
              <div className="py-16 text-center">
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  {query ? "No Matching Projects" : "No Projects Found"}
                </h3>
                <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
                  {query 
                    ? "No projects match your search criteria. Try adjusting your search terms." 
                    : "Connect to Jira to view your projects and start managing your work."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <ProjectCard 
                    key={`${p.key}-${p.name}`}
                    code={p.key} 
                    title={p.name} 
                    onClick={() => showInfo(`Opening ${p.name} project details...`)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Token modals */}
      <TokenModal
        open={showJiraToken}
        connector="jira"
        onClose={() => setShowJiraToken(false)}
        onSuccess={() => {
          fetchStatuses();
          loadProjects(query);
        }}
      />
      <TokenModal
        open={showConfToken}
        connector="confluence"
        onClose={() => setShowConfToken(false)}
        onSuccess={() => {
          fetchStatuses();
        }}
      />
    </main>
  );
}
