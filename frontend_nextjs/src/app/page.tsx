"use client";

import React from "react";
import SectionCard from "../components/SectionCard";
import ConnectorCard from "../components/ConnectorCard";
import SearchBar from "../components/SearchBar";
import ProjectCard from "../components/ProjectCard";
import TokenModal from "../components/TokenModal";
import { apiGet, getApiBase } from "../lib/api";

type JiraProject = { key: string; name: string };
type ConnectorStatus = "connected" | "disconnected";

const API_BASE = getApiBase();

export default function Home() {
  // Connector states
  const [jiraStatus, setJiraStatus] = React.useState<ConnectorStatus>("disconnected");
  const [jiraMeta, setJiraMeta] = React.useState<string>("—");

  const [confStatus, setConfStatus] = React.useState<ConnectorStatus>("disconnected");
  const [confMeta, setConfMeta] = React.useState<string>("—");

  // OAuth / callback banner
  const [isCallbackRefreshing, setIsCallbackRefreshing] = React.useState(false);
  const [callbackError, setCallbackError] = React.useState<string | null>(null);

  // Token modal visibility
  const [showJiraToken, setShowJiraToken] = React.useState(false);
  const [showConfToken, setShowConfToken] = React.useState(false);

  // Projects state
  const [projects, setProjects] = React.useState<JiraProject[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState<boolean>(false);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState<string>("");

  // Fetch connector statuses
  const fetchStatuses = React.useCallback(async () => {
    try {
      const [jira, conf] = await Promise.allSettled([
        apiGet<unknown>("/auth/jira/status"),
        apiGet<unknown>("/auth/confluence/status"),
      ]);

      if (jira.status === "fulfilled") {
        const data = jira.value as Record<string, unknown>;
        const connected = Boolean(
          data?.connected ?? data?.is_connected ?? (data?.status as string) === "connected"
        );
        setJiraStatus(connected ? "connected" : "disconnected");
        if (typeof data?.projects_count === "number") {
          setJiraMeta(`${data.projects_count as number} Projects`);
        } else if (connected) {
          setJiraMeta("Connected");
        } else {
          setJiraMeta("—");
        }
      }

      if (conf.status === "fulfilled") {
        const data = conf.value as Record<string, unknown>;
        const connected = Boolean(
          data?.connected ?? data?.is_connected ?? (data?.status as string) === "connected"
        );
        setConfStatus(connected ? "connected" : "disconnected");
        if (typeof data?.spaces_count === "number") {
          setConfMeta(`${data.spaces_count as number} Spaces`);
        } else if (connected) {
          setConfMeta("Connected");
        } else {
          setConfMeta("—");
        }
      }
    } catch {
      // soft fail
    }
  }, []);

  React.useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Detect OAuth callback by query params (common: code/state or oauth_token)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const hasOAuthParams =
      url.searchParams.has("code") ||
      url.searchParams.has("state") ||
      url.searchParams.has("oauth_token") ||
      url.searchParams.has("jira_oauth") ||
      url.searchParams.has("conf_oauth");

    if (hasOAuthParams) {
      setIsCallbackRefreshing(true);
      // Allow backend to complete callback via its own redirect flow; we just refresh statuses.
      fetchStatuses()
        .then(async () => {
          // Optionally refresh projects after Jira connects
          await loadProjects(query);
        })
        .catch((e) => {
          const msg =
            typeof e === "object" && e !== null && "message" in e
              ? (e as { message: string }).message
              : "Authentication updated, but failed to refresh status.";
          setCallbackError(msg);
        })
        .finally(() => {
          setIsCallbackRefreshing(false);
          // Clean the URL so users can refresh without repeating callback state
          url.search = "";
          window.history.replaceState({}, document.title, url.toString());
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    [API_BASE]
  );

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function handleSearch(value: string) {
    setQuery(value);
    loadProjects(value);
  }

  // Sidebar CTA handlers (wire to OAuth/API token flow endpoints)
  const startOAuth = async (path: string) => {
    try {
      // some backends return { url }, some do 302. Support both:
      const res = await fetch(`${API_BASE}${path}`, { method: "GET", redirect: "follow" });
      // If it redirected, browser should have followed. If still here, try parse URL from JSON.
      if (res.redirected && res.url) {
        window.location.href = res.url;
        return;
      }
      const text = await res.text();
      try {
        const json = JSON.parse(text) as { url?: string; redirect_url?: string };
        const url = json.url || json.redirect_url;
        if (url) {
          window.location.href = url;
          return;
        }
      } catch {
        // not JSON; if text looks like URL, attempt redirect
        if (/^https?:\/\//i.test(text.trim())) {
          window.location.href = text.trim();
          return;
        }
      }
      // fallback: navigate to endpoint, backend may issue redirect
      window.location.href = `${API_BASE}${path}`;
    } catch {
      // as last resort, navigate
      window.location.href = `${API_BASE}${path}`;
    }
  };

  const handleJiraCTA = () => {
    if (jiraStatus === "connected") {
      loadProjects(query);
    } else {
      startOAuth("/auth/jira/oauth/start");
    }
  };

  const handleConfluenceCTA = () => {
    if (confStatus === "connected") {
      // If connected, attempt to open spaces endpoint in a new tab (or could navigate to a UI route)
      window.open(`${API_BASE}/confluence/spaces`, "_blank", "noopener,noreferrer");
    } else {
      startOAuth("/auth/confluence/oauth/start");
    }
  };

  const renderProjects = () => {
    if (isCallbackRefreshing) {
      return (
        <div className="py-8 text-sm text-slate-600" role="status" aria-live="polite">
          Finalizing authentication... refreshing data.
        </div>
      );
    }

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
      {callbackError ? (
        <div className="mb-3 p-3 rounded-md bg-red-50 text-sm text-red-700 border border-red-200">
          {callbackError}
        </div>
      ) : null}

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
              cta={{
                label: confStatus === "connected" ? "View" : "Connect",
                onClick: handleConfluenceCTA,
                ariaLabel: "Confluence connector action",
              }}
              secondaryCta={{
                label: "Use API Token",
                onClick: () => setShowConfToken(true),
                ariaLabel: "Connect Confluence using API Token",
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
