"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionCard from "./SectionCard";
import ConnectorCard from "./ConnectorCard";
import SearchBar from "./SearchBar";
import ProjectCard from "./ProjectCard";
import TokenModal from "./TokenModal";
import SkeletonLoader from "./SkeletonLoader";
import { useToast } from "./ToastProvider";
import { apiGet, getApiBase } from "../lib/api";

type JiraProject = { key: string; name: string };
type ConnectorStatus = "connected" | "disconnected" | "connecting";

const API_BASE = getApiBase();

// PUBLIC_INTERFACE
/**
 * EnhancedDashboard provides the full-featured dashboard with animations,
 * loading states, and interactive components for managing Jira and Confluence connections.
 */
export default function EnhancedDashboard() {
  const { showSuccess, showError, showInfo } = useToast();

  // Connector states
  const [jiraStatus, setJiraStatus] = React.useState<ConnectorStatus>("disconnected");
  const [jiraMeta, setJiraMeta] = React.useState<string>("—");
  const [jiraLoading, setJiraLoading] = React.useState(false);

  const [confStatus, setConfStatus] = React.useState<ConnectorStatus>("disconnected");
  const [confMeta, setConfMeta] = React.useState<string>("—");
  const [confLoading, setConfLoading] = React.useState(false);

  // OAuth / callback banner
  const [isCallbackRefreshing, setIsCallbackRefreshing] = React.useState(false);

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
      showInfo("Processing authentication callback...");
      
      // Allow backend to complete callback via its own redirect flow; we just refresh statuses.
      fetchStatuses()
        .then(async () => {
          showSuccess("Authentication completed successfully!");
          // Optionally refresh projects after Jira connects
          await loadProjects(query);
        })
        .catch((e) => {
          const msg =
            typeof e === "object" && e !== null && "message" in e
              ? (e as { message: string }).message
              : "Authentication updated, but failed to refresh status.";
          showError(msg);
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

        // Update status if we successfully loaded projects
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

  // Sidebar CTA handlers (wire to OAuth/API token flow endpoints)
  const startOAuth = async (path: string, connector: string, setLoading: (loading: boolean) => void) => {
    setLoading(true);
    showInfo(`Starting ${connector} authentication...`);
    
    try {
      const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);

      const res = await fetch(`${API_BASE}${path}`, { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      if (!res.ok) {
        throw new Error(`Authentication failed (${res.status})`);
      }

      const data = await res.json() as { auth_url?: string; url?: string };
      const authUrl = data.auth_url || data.url;
      
      if (authUrl) {
        showInfo(`Redirecting to ${connector} authentication...`);
        window.location.href = authUrl;
        return;
      }
      
      throw new Error("No authentication URL received");
    } catch (error) {
      console.error(`OAuth start failed:`, error);
      const message = typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : `Failed to start ${connector} authentication`;
      showError(message);
      setLoading(false);
    }
  };

  const handleJiraCTA = () => {
    if (jiraStatus === "connected") {
      loadProjects(query);
    } else {
      startOAuth("/auth/jira/oauth/start", "Jira", setJiraLoading);
    }
  };

  const handleConfluenceCTA = async () => {
    if (confStatus === "connected") {
      setConfLoading(true);
      try {
        const sessionId = localStorage.getItem('sessionId');
        const url = `${API_BASE}/confluence/spaces?session_id=${sessionId}`;
        window.open(url, "_blank", "noopener,noreferrer");
        showInfo("Opening Confluence spaces in new tab");
      } catch {
        showError("Failed to open Confluence spaces");
      } finally {
        setConfLoading(false);
      }
    } else {
      startOAuth("/auth/confluence/oauth/start", "Confluence", setConfLoading);
    }
  };

  const renderProjects = () => {
    if (isCallbackRefreshing) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 text-center"
          role="status" 
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-3 text-[var(--brand-accent)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border border-[var(--brand-accent)]/30 border-t-[var(--brand-accent)] rounded-full"
            />
            <span className="text-sm font-medium">Finalizing authentication...</span>
          </div>
        </motion.div>
      );
    }

    if (loadingProjects) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SkeletonLoader count={6} type="project" />
        </motion.div>
      );
    }

    if (projectsError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8 text-center"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-red-800 mb-2">Unable to Load Projects</h3>
            <p className="text-sm text-red-600 mb-4">{projectsError}</p>
            <motion.button
              type="button"
              onClick={() => loadProjects(query)}
              className="h-9 px-4 rounded-md bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      );
    }

    if (!projects.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-16 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            {query ? "No Matching Projects" : "No Projects Found"}
          </h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
            {query 
              ? "No projects match your search criteria. Try adjusting your search terms." 
              : "Connect to Jira to view your projects and start managing your work."
            }
          </p>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {projects.map((p, index) => (
            <motion.div
              key={`${p.key}-${p.name}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProjectCard 
                code={p.key} 
                title={p.name} 
                onClick={() => showInfo(`Opening ${p.name} project details...`)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
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
            <SkeletonLoader count={2} type="connector" />
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
            <AnimatePresence mode="wait">
              {renderProjects()}
            </AnimatePresence>
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
