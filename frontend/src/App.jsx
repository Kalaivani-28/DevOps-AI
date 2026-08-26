import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080";
const AI_BASE = "http://localhost:8000";

const DEFAULT_PROFILE = {
  name: "DevOps Engineer",
  email: "devops@example.com",
  role: "DevOps Engineer",
  team: "Platform Engineering",
};

const sampleLogs = `2026-08-25 14:32:17 ERROR PaymentService Database connection timeout
2026-08-25 14:32:18 ERROR PaymentService Unable to process payment
2026-08-25 14:32:19 ERROR OrderService Payment service unavailable`;

const initialIncidents = [
  {
    id: "INC-1042",
    service: "Payment Service",
    severity: "Critical",
    status: "Investigating",
    message: "Database connection timeout",
    time: "2 min ago",
  },
  {
    id: "INC-1041",
    service: "Order Service",
    severity: "High",
    status: "Investigating",
    message: "Payment service unavailable",
    time: "8 min ago",
  },
  {
    id: "INC-1040",
    service: "Notification Service",
    severity: "Medium",
    status: "Resolved",
    message: "Delayed notification delivery",
    time: "24 min ago",
  },
  {
    id: "INC-1039",
    service: "Auth Service",
    severity: "Low",
    status: "Resolved",
    message: "Elevated response time",
    time: "41 min ago",
  },
];

const initialServices = [
  {
    name: "Payment Service",
    status: "Critical",
    uptime: "97.8%",
    latency: "840 ms",
    requests: "12.4K",
  },
  {
    name: "Order Service",
    status: "Healthy",
    uptime: "99.9%",
    latency: "118 ms",
    requests: "18.7K",
  },
  {
    name: "Auth Service",
    status: "Healthy",
    uptime: "99.99%",
    latency: "76 ms",
    requests: "24.1K",
  },
  {
    name: "Notification Service",
    status: "Warning",
    uptime: "98.6%",
    latency: "320 ms",
    requests: "9.8K",
  },
  {
    name: "API Gateway",
    status: "Healthy",
    uptime: "99.95%",
    latency: "64 ms",
    requests: "48.2K",
  },
  {
    name: "User Service",
    status: "Healthy",
    uptime: "99.97%",
    latency: "91 ms",
    requests: "15.6K",
  },
];

const initialAlerts = [
  {
    id: 1,
    type: "critical",
    icon: "!",
    title: "Payment Service failure",
    message: "Database connection timeout detected.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    icon: "!",
    title: "Notification latency",
    message: "Response time exceeded 300ms.",
    time: "12 minutes ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    icon: "✓",
    title: "Deployment completed",
    message: "Order Service deployment completed successfully.",
    time: "28 minutes ago",
    read: true,
  },
];

const load = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function getInitialProfile() {
  try {
    const saved = localStorage.getItem("devops_profile");

    if (!saved) {
      return DEFAULT_PROFILE;
    }

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function getInitialPage() {
  return "Dashboard";
}

function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem("devops_logged_in") === "true"
  );

  const [page, setPage] = useState(getInitialPage);

  const [darkMode, setDarkMode] = useState(() =>
    load("devops_dark", false)
  );

  const [incidents, setIncidents] = useState(() =>
    load("devops_incidents", initialIncidents)
  );

  const [alerts, setAlerts] = useState(() =>
    load("devops_alerts", initialAlerts)
  );

  const [services, setServices] = useState(initialServices);

  const [logs, setLogs] = useState(sampleLogs);

  const [analysis, setAnalysis] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);

  const [toast, setToast] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);

  /*
   * PROFILE
   *
   * This is loaded from localStorage when the application starts.
   */
  const [profile, setProfile] = useState(getInitialProfile);

  /*
   * Save profile automatically whenever profile changes.
   *
   * This means the profile survives page refresh.
   */
  useEffect(() => {
    localStorage.setItem("devops_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("devops_dark", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(
      "devops_incidents",
      JSON.stringify(incidents)
    );
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(
      "devops_alerts",
      JSON.stringify(alerts)
    );
  }, [alerts]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(
    () => ({
      total: incidents.length,
      critical: incidents.filter(
        (i) => i.severity === "Critical"
      ).length,
      active: incidents.filter(
        (i) => i.status !== "Resolved"
      ).length,
      resolved: incidents.filter(
        (i) => i.status === "Resolved"
      ).length,
    }),
    [incidents]
  );

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const notify = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    sessionStorage.setItem("devops_logged_in", "true");

    setLoggedIn(true);

    setPage("Dashboard");

    notify("Welcome to DevOps Intelligence");
  };

  const logout = () => {
    sessionStorage.removeItem("devops_logged_in");

    setLoggedIn(false);

    setPage("Dashboard");
  };

  const analyzeLogs = async (
    service = "Payment Service"
  ) => {
    if (!logs.trim()) {
      notify(
        "Please enter or paste logs first.",
        "error"
      );
      return;
    }

    setAnalyzing(true);

    setAnalysis(null);

    try {
      const response = await fetch(
        `${AI_BASE}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            logs,
            service,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const data = await response.json();

      setAnalysis({
        severity: data.severity || "HIGH",

        rootCause:
          data.rootCause ||
          data.root_cause ||
          "Possible service timeout or network latency",

        confidence: Number(
          data.confidence ?? 84
        ),

        actions:
          data.recommendedActions ||
          data.recommended_actions || [
            "Check database connectivity",
            "Review service response times",
            "Inspect recent deployment changes",
          ],

        summary:
          data.summary ||
          "AI analysis completed successfully.",
      });

      notify("AI analysis completed.");
    } catch {
      const fallback = localAnalyze(logs);

      setAnalysis(fallback);

      notify(
        "AI server unavailable. Local fallback analysis was used.",
        "warning"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const createIncident = (incident) => {
    const nextNumber =
      Math.max(
        ...incidents.map(
          (i) =>
            Number(
              i.id.split("-")[1]
            ) || 0
        ),
        1042
      ) + 1;

    const newIncident = {
      id: `INC-${nextNumber}`,
      service: incident.service,
      severity: incident.severity,
      status: "Investigating",
      message: incident.message,
      time: "Just now",
    };

    setIncidents((current) => [
      newIncident,
      ...current,
    ]);

    setAlerts((current) => [
      {
        id: Date.now(),
        type:
          incident.severity === "Critical"
            ? "critical"
            : incident.severity === "High"
            ? "warning"
            : "info",
        icon:
          incident.severity === "Critical"
            ? "!"
            : "•",
        title: `${incident.service} incident created`,
        message: incident.message,
        time: "Just now",
        read: false,
      },
      ...current,
    ]);

    notify(
      `${newIncident.id} created successfully.`
    );
  };

  const resolveIncident = (id) => {
    setIncidents((current) =>
      current.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "Resolved",
              time: "Just now",
            }
          : i
      )
    );

    setAlerts((current) => [
      {
        id: Date.now(),
        type: "info",
        icon: "✓",
        title: "Incident resolved",
        message: `${id} was marked as resolved.`,
        time: "Just now",
        read: false,
      },
      ...current,
    ]);

    notify(`${id} resolved.`);
  };

  const clearResolved = () => {
    const count = incidents.filter(
      (i) => i.status === "Resolved"
    ).length;

    setIncidents((current) =>
      current.filter(
        (i) => i.status !== "Resolved"
      )
    );

    notify(
      count
        ? `${count} resolved incident(s) archived.`
        : "No resolved incidents to archive.",
      count ? "success" : "warning"
    );
  };

  const refreshServices = () => {
    setServices((current) =>
      current.map((service) => ({
        ...service,

        latency:
          service.status === "Critical"
            ? `${Math.floor(
                700 + Math.random() * 180
              )} ms`
            : `${Math.floor(
                50 + Math.random() * 260
              )} ms`,
      }))
    );

    notify("Service metrics refreshed.");
  };

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div
      className={`app ${
        darkMode ? "dark" : ""
      }`}
    >
      <Sidebar
        page={page}
        setPage={setPage}
        incidents={stats.active}
        onLogout={logout}
        profile={profile}
      />

      <main className="main">
        <TopBar
          page={page}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          unreadAlerts={unreadAlerts}
          onNotifications={() =>
            setShowNotifications(
              (v) => !v
            )
          }
          profile={profile}
        />

        {showNotifications && (
          <NotificationPanel
            alerts={alerts}
            onClose={() =>
              setShowNotifications(false)
            }
            onRead={(id) =>
              setAlerts((current) =>
                current.map((a) =>
                  a.id === id
                    ? {
                        ...a,
                        read: true,
                      }
                    : a
                )
              )
            }
            onReadAll={() =>
              setAlerts((current) =>
                current.map((a) => ({
                  ...a,
                  read: true,
                }))
              )
            }
          />
        )}

        <section className="content">
          {page === "Dashboard" && (
            <Dashboard
              stats={stats}
              incidents={incidents}
              services={services}
              setPage={setPage}
              refreshServices={
                refreshServices
              }
              profile={profile}
            />
          )}

          {page === "Incidents" && (
            <Incidents
              incidents={incidents}
              onResolve={
                resolveIncident
              }
              onCreate={
                createIncident
              }
              onArchive={
                clearResolved
              }
            />
          )}

          {page === "AI Analyzer" && (
            <AIAnalyzer
              logs={logs}
              setLogs={setLogs}
              analysis={analysis}
              analyzing={analyzing}
              analyzeLogs={
                analyzeLogs
              }
            />
          )}

          {page === "Services" && (
            <Services
              services={services}
              refreshServices={
                refreshServices
              }
            />
          )}

          {page === "Alerts" && (
            <Alerts
              alerts={alerts}
              setAlerts={setAlerts}
            />
          )}

          {page === "Reports" && (
            <Reports
              incidents={incidents}
              stats={stats}
              notify={notify}
            />
          )}

          {page === "Profile" && (
            <Profile
              profile={profile}
              setProfile={setProfile}
              notify={notify}
            />
          )}

          {page === "Settings" && (
            <Settings
              darkMode={darkMode}
              setDarkMode={
                setDarkMode
              }
              notify={notify}
            />
          )}
        </section>
      </main>

      {toast && (
        <Toast {...toast} />
      )}
    </div>
  );
}

function localAnalyze(logText) {
  const text = logText.toLowerCase();

  const critical =
    /timeout|connection refused|database unavailable|fatal|outage/.test(
      text
    );

  const high =
    /error|failed|failure|unavailable|exception/.test(
      text
    );

  let rootCause =
    "No strong failure pattern detected.";

  let actions = [
    "Review application logs",
    "Check service health metrics",
    "Monitor the incident for recurrence",
  ];

  if (
    /database|db/.test(text) &&
    /timeout|connection/.test(text)
  ) {
    rootCause =
      "Database connectivity or downstream database latency is the most likely root cause.";

    actions = [
      "Check database connectivity and connection pool usage",
      "Review database CPU, memory and active connections",
      "Inspect network latency between the service and database",
    ];
  } else if (
    /payment/.test(text) &&
    /unavailable|failed|timeout/.test(text)
  ) {
    rootCause =
      "Payment Service is experiencing a downstream dependency or network timeout.";

    actions = [
      "Check Payment Service health",
      "Inspect downstream dependency response time",
      "Review the latest deployment and application logs",
    ];
  } else if (high) {
    rootCause =
      "Application-level errors or an unavailable dependency are likely contributing to the incident.";

    actions = [
      "Inspect recent application errors",
      "Check dependent services",
      "Review recent deployments",
    ];
  }

  return {
    severity: critical
      ? "CRITICAL"
      : high
      ? "HIGH"
      : "MEDIUM",

    rootCause,

    confidence: critical
      ? 91
      : high
      ? 84
      : 72,

    actions,

    summary:
      "Fallback rule-based analysis completed locally.",
  };
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState(
    () =>
      localStorage.getItem(
        "devops_last_email"
      ) ||
      "devops@example.com"
  );

  const [password, setPassword] =
    useState("password");

  const [showPassword, setShowPassword] =
    useState(false);

  const [remember, setRemember] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const submit = (e) => {
    e.preventDefault();

    if (
      !email.includes("@") ||
      password.length < 4
    ) {
      setMessage(
        "Enter a valid email and a password with at least 4 characters."
      );
      return;
    }

    if (remember) {
      localStorage.setItem(
        "devops_last_email",
        email
      );
    }

    onLogin(e);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            AI
          </div>

          <div>
            <strong>
              DevOps Intelligence
            </strong>

            <small>
              Incident Analyzer Platform
            </small>
          </div>
        </div>

        <div className="login-hero">
          <div className="hero-tag">
            ● AI-POWERED DEVOPS PLATFORM
          </div>

          <h1>
            Resolve incidents
            <br />
            <span>
              smarter & faster.
            </span>
          </h1>

          <p>
            Monitor infrastructure,
            analyze incidents with AI,
            identify root causes and keep
            services reliable from one
            unified DevOps workspace.
          </p>

          <div className="devops-features">
            <div className="devops-feature">
              <strong>
                🤖 AI Analysis
              </strong>
              <span>
                Root cause detection
              </span>
            </div>

            <div className="devops-feature">
              <strong>
                📊 Monitoring
              </strong>
              <span>
                Service health metrics
              </span>
            </div>

            <div className="devops-feature">
              <strong>
                🚨 Alerts
              </strong>
              <span>
                Incident notifications
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <form
          className="login-card"
          onSubmit={submit}
        >
          <div className="login-icon">
            ⚡
          </div>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to your DevOps
            command center
          </p>

          <div className="login-field">
            <label>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="login-field password-wrap">
            <label>
              Password
            </label>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (v) => !v
                )
              }
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>

          <div className="login-options">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) =>
                  setRemember(
                    e.target.checked
                  )
                }
              />

              Remember me
            </label>

            <button
              type="button"
              className="forgot"
              onClick={() =>
                setMessage(
                  "Password reset is a demo action. Connect it to your auth backend when ready."
                )
              }
            >
              Forgot password?
            </button>
          </div>

          {message && (
            <div className="form-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Sign In →
          </button>

          <div className="login-demo">
            Demo mode: any valid email
            and password will open the
            dashboard.
          </div>
        </form>
      </div>
    </div>
  );
}

function Sidebar({
  page,
  setPage,
  incidents,
  onLogout,
  profile,
}) {
  const menu = [
    ["Dashboard", "▦"],
    ["Incidents", "⚠"],
    ["AI Analyzer", "✦"],
    ["Services", "▣"],
    ["Alerts", "🔔"],
    ["Reports", "▤"],
  ];

  const account = [
    ["Profile", "●"],
    ["Settings", "⚙"],
  ];

  const initials =
    profile.name
      .split(" ")
      .map((word) =>
        word.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const renderMenu = (items) => (
    <nav>
      {items.map(
        ([name, icon]) => (
          <button
            key={name}
            className={`nav-item ${
              page === name
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPage(name)
            }
          >
            <span className="nav-icon">
              {icon}
            </span>

            <span>
              {name}
            </span>

            {name === "Incidents" &&
              incidents > 0 && (
                <span className="notification-badge">
                  {incidents}
                </span>
              )}
          </button>
        )
      )}
    </nav>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          AI
        </div>

        <div>
          <h2>
            DevOps AI
          </h2>

          <span>
            Incident Analyzer
          </span>
        </div>
      </div>

      <div className="menu-label">
        MAIN MENU
      </div>

      {renderMenu(menu)}

      <div className="menu-label account-label">
        ACCOUNT
      </div>

      {renderMenu(account)}

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="avatar">
            {initials}
          </div>

          <div className="user-card-info">
            <strong>
              {profile.name}
            </strong>

            <small>
              ● Online
            </small>
          </div>

          <button
            className="logout-button"
            onClick={onLogout}
            title="Logout"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({
  page,
  darkMode,
  setDarkMode,
  unreadAlerts,
  onNotifications,
  profile,
}) {
  const initials =
    profile.name
      .split(" ")
      .map((word) =>
        word.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <header className="topbar">
      <div>
        <div className="breadcrumb">
          DevOps Platform / {page}
        </div>

        <h1>
          {page}
        </h1>
      </div>

      <div className="top-actions">
        <button
          className="icon-button notification-button"
          onClick={onNotifications}
          title="Notifications"
        >
          🔔

          {unreadAlerts > 0 && (
            <span className="top-badge">
              {unreadAlerts}
            </span>
          )}
        </button>

        <button
          className="icon-button"
          onClick={() =>
            setDarkMode(
              (v) => !v
            )
          }
          title="Toggle theme"
        >
          {darkMode
            ? "☀"
            : "🌙"}
        </button>

        <div className="profile">
          <div className="avatar">
            {initials}
          </div>

          <div>
            <strong>
              {profile.name}
            </strong>

            <small>
              ● Online
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationPanel({
  alerts,
  onClose,
  onRead,
  onReadAll,
}) {
  return (
    <div className="notification-panel">
      <div className="notification-head">
        <div>
          <strong>
            Notifications
          </strong>

          <small>
            {
              alerts.filter(
                (a) => !a.read
              ).length
            }{" "}
            unread
          </small>
        </div>

        <div>
          <button
            className="text-button"
            onClick={onReadAll}
          >
            Read all
          </button>

          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </div>

      <div className="notification-items">
        {alerts
          .slice(0, 6)
          .map((a) => (
            <button
              key={a.id}
              className={`notification-item ${
                a.read
                  ? "read"
                  : ""
              }`}
              onClick={() =>
                onRead(a.id)
              }
            >
              <span
                className={`alert-mini ${a.type}`}
              >
                {a.icon}
              </span>

              <span>
                <strong>
                  {a.title}
                </strong>

                <small>
                  {a.message}
                </small>

                <em>
                  {a.time}
                </em>
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}

function Dashboard({
  stats,
  incidents,
  services,
  setPage,
  refreshServices,
  profile,
}) {
  const bars = [
    35,
    55,
    42,
    80,
    65,
    92,
    70,
  ];

  return (
    <>
      <div className="welcome">
        <div>
          <h2>
            Good morning,{" "}
            {profile.name} 👋
          </h2>

          <p>
            Here's what's happening
            across your infrastructure
            today.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            setPage("AI Analyzer")
          }
        >
          ✦ Analyze Incident
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="🚨"
          value={stats.total}
          title="Total Incidents"
          trend="+12%"
          description="Compared with last week"
        />

        <StatCard
          icon="🔴"
          value={stats.critical}
          title="Critical Incidents"
          trend="-8%"
          description="Needs immediate attention"
        />

        <StatCard
          icon="⚡"
          value={stats.active}
          title="Active Incidents"
          trend="+4%"
          description="Currently being investigated"
        />

        <StatCard
          icon="✓"
          value={stats.resolved}
          title="Resolved"
          trend="+18%"
          description="Successfully closed"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Incident Analytics
              </h3>

              <p>
                Incidents detected
                during the week
              </p>
            </div>

            <select className="small-select">
              <option>
                Last 7 days
              </option>

              <option>
                Last 30 days
              </option>

              <option>
                Last 90 days
              </option>
            </select>
          </div>

          <div className="chart">
            {bars.map(
              (height, index) => (
                <div
                  className="chart-column"
                  key={index}
                >
                  <div className="bar-wrapper">
                    <div
                      className={`bar ${
                        index === 3
                          ? "critical"
                          : index === 5
                          ? "high"
                          : "medium"
                      }`}
                      style={{
                        height: `${height}%`,
                      }}
                    >
                      <span>
                        {Math.round(
                          height / 10
                        )}
                      </span>
                    </div>
                  </div>

                  <small>
                    {
                      [
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                        "Sun",
                      ][index]
                    }
                  </small>
                </div>
              )
            )}
          </div>
        </div>

        <ServiceHealth
          services={services}
          onRefresh={
            refreshServices
          }
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>
              Recent Incidents
            </h3>

            <p>
              Latest events detected
              by the platform
            </p>
          </div>

          <button
            className="text-button"
            onClick={() =>
              setPage("Incidents")
            }
          >
            View all →
          </button>
        </div>

        <IncidentTable
          incidents={incidents.slice(
            0,
            5
          )}
        />
      </div>
    </>
  );
}

function StatCard({
  icon,
  value,
  title,
  trend,
  description,
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          {icon}
        </div>

        <span className="trend">
          {trend}
        </span>
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-title">
        {title}
      </div>

      <div className="stat-description">
        {description}
      </div>
    </div>
  );
}

function ServiceHealth({
  services,
  onRefresh,
}) {
  const healthy =
    services.filter(
      (s) => s.status === "Healthy"
    ).length;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h3>
            Service Health
          </h3>

          <p>
            Current infrastructure
            status
          </p>
        </div>

        <button
          className="text-button"
          onClick={onRefresh}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="health-summary-row">
        <span className="healthy-summary">
          ● {healthy}/{services.length}{" "}
          healthy
        </span>

        <span className="status-text">
          Live metrics
        </span>
      </div>

      <div className="health-list">
        {services
          .slice(0, 5)
          .map((service) => (
            <div
              className="health-row"
              key={service.name}
            >
              <div className="service-info">
                <span
                  className={`health-dot ${service.status.toLowerCase()}`}
                />

                <div>
                  <strong>
                    {service.name}
                  </strong>

                  <small>
                    Latency{" "}
                    {
                      service.latency
                    }
                  </small>
                </div>
              </div>

              <span
                className={`status-pill ${service.status.toLowerCase()}`}
              >
                {service.status}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function Incidents({
  incidents,
  onResolve,
  onCreate,
  onArchive,
}) {
  const [query, setQuery] =
    useState("");

  const [severity, setSeverity] =
    useState("All");

  const [status, setStatus] =
    useState("All");

  const [showModal, setShowModal] =
    useState(false);

  const filtered =
    incidents.filter((i) => {
      const matchesQuery = [
        i.id,
        i.service,
        i.message,
      ]
        .join(" ")
        .toLowerCase()
        .includes(
          query.toLowerCase()
        );

      return (
        matchesQuery &&
        (severity === "All" ||
          i.severity ===
            severity) &&
        (status === "All" ||
          i.status === status)
      );
    });

  return (
    <>
      <div className="page-intro">
        <div>
          <h2>
            Incident Management
          </h2>

          <p>
            Track, investigate and
            resolve infrastructure
            incidents.
          </p>
        </div>

        <div className="button-row">
          <button
            className="secondary-button"
            onClick={onArchive}
          >
            Archive Resolved
          </button>

          <button
            className="primary-button"
            onClick={() =>
              setShowModal(true)
            }
          >
            + Create Incident
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          ⌕
          <input
            placeholder="Search incidents..."
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
          />
        </div>

        <select
          className="small-select"
          value={severity}
          onChange={(e) =>
            setSeverity(
              e.target.value
            )
          }
        >
          <option>
            All
          </option>
          <option>
            Critical
          </option>
          <option>
            High
          </option>
          <option>
            Medium
          </option>
          <option>
            Low
          </option>
        </select>

        <select
          className="small-select"
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
        >
          <option>
            All
          </option>
          <option>
            Investigating
          </option>
          <option>
            Resolved
          </option>
        </select>

        <span className="filter-count">
          {filtered.length} result(s)
        </span>
      </div>

      <div className="panel">
        <IncidentTable
          incidents={filtered}
          action={onResolve}
        />
      </div>

      {showModal && (
        <CreateIncidentModal
          onClose={() =>
            setShowModal(false)
          }
          onCreate={(data) => {
            onCreate(data);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function IncidentTable({
  incidents,
  action,
}) {
  if (!incidents.length) {
    return (
      <div className="empty-state">
        <div>⌕</div>

        <h3>
          No incidents found
        </h3>

        <p>
          Try changing your search
          or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>SERVICE</th>
            <th>SEVERITY</th>
            <th>MESSAGE</th>
            <th>STATUS</th>
            <th>TIME</th>

            {action && (
              <th>ACTION</th>
            )}
          </tr>
        </thead>

        <tbody>
          {incidents.map((i) => (
            <tr key={i.id}>
              <td>
                <strong>
                  {i.id}
                </strong>
              </td>

              <td>
                {i.service}
              </td>

              <td>
                <span
                  className={`severity-badge ${i.severity.toLowerCase()}`}
                >
                  {i.severity}
                </span>
              </td>

              <td>
                {i.message}
              </td>

              <td>
                <span
                  className={`status-pill ${
                    i.status ===
                    "Resolved"
                      ? "healthy"
                      : "warning"
                  }`}
                >
                  {i.status}
                </span>
              </td>

              <td>
                {i.time}
              </td>

              {action && (
                <td>
                  {i.status !==
                    "Resolved" && (
                    <button
                      className="table-action"
                      onClick={() =>
                        action(
                          i.id
                        )
                      }
                    >
                      Resolve
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateIncidentModal({
  onClose,
  onCreate,
}) {
  const [form, setForm] =
    useState({
      service:
        "Payment Service",
      severity: "High",
      message: "",
    });

  const submit = (e) => {
    e.preventDefault();

    if (!form.message.trim()) {
      return;
    }

    onCreate(form);
  };

  return (
    <Modal
      title="Create Incident"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <label>
          Service

          <select
            value={form.service}
            onChange={(e) =>
              setForm({
                ...form,
                service:
                  e.target.value,
              })
            }
          >
            {initialServices.map(
              (s) => (
                <option
                  key={s.name}
                >
                  {s.name}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Severity

          <select
            value={form.severity}
            onChange={(e) =>
              setForm({
                ...form,
                severity:
                  e.target.value,
              })
            }
          >
            <option>
              Critical
            </option>
            <option>
              High
            </option>
            <option>
              Medium
            </option>
            <option>
              Low
            </option>
          </select>
        </label>

        <label>
          Incident message

          <textarea
            rows="4"
            placeholder="Describe the incident..."
            value={
              form.message
            }
            onChange={(e) =>
              setForm({
                ...form,
                message:
                  e.target.value,
              })
            }
            required
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button className="primary-button">
            Create Incident
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AIAnalyzer({
  logs,
  setLogs,
  analysis,
  analyzing,
  analyzeLogs,
}) {
  const [service, setService] =
    useState("Payment Service");

  const loadSample = () =>
    setLogs(sampleLogs);

  const clear = () =>
    setLogs("");

  return (
    <>
      <div className="page-intro">
        <div>
          <h2>
            AI Incident Analyzer
          </h2>

          <p>
            Detect root causes,
            severity and recommended
            actions from application
            logs.
          </p>
        </div>

        <span className="ai-status">
          ✦ AI Engine Online
        </span>
      </div>

      <div className="analyzer-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Incident Logs
              </h3>

              <p>
                Paste application logs
                below
              </p>
            </div>

            <select
              className="small-select"
              value={service}
              onChange={(e) =>
                setService(
                  e.target.value
                )
              }
            >
              {initialServices.map(
                (s) => (
                  <option
                    key={s.name}
                  >
                    {s.name}
                  </option>
                )
              )}
            </select>
          </div>

          <textarea
            className="log-editor"
            value={logs}
            onChange={(e) =>
              setLogs(
                e.target.value
              )
            }
            placeholder="Paste logs here..."
          />

          <div className="analyzer-actions">
            <button
              className="secondary-button"
              onClick={loadSample}
            >
              Load Sample
            </button>

            <button
              className="secondary-button"
              onClick={clear}
            >
              Clear
            </button>

            <button
              className="primary-button"
              onClick={() =>
                analyzeLogs(
                  service
                )
              }
              disabled={analyzing}
            >
              {analyzing
                ? "Analyzing..."
                : "✦ Analyze Logs"}
            </button>
          </div>
        </div>

        <div className="panel analysis-panel">
          <div className="panel-header">
            <div>
              <h3>
                AI Analysis
              </h3>

              <p>
                Root cause analysis
                results
              </p>
            </div>

            {analysis && (
              <span className="result-time">
                Completed
              </span>
            )}
          </div>

          {!analysis ? (
            <div className="analysis-empty">
              <div className="big-ai-icon">
                ✦
              </div>

              <h3>
                Ready to analyze
              </h3>

              <p>
                Paste incident logs
                and click Analyze Logs
                to get AI-powered
                insights.
              </p>
            </div>
          ) : (
            <div className="analysis-result">
              <div className="result-top">
                <span className="result-label">
                  SEVERITY
                </span>

                <span
                  className={`severity-badge ${analysis.severity.toLowerCase()}`}
                >
                  {analysis.severity}
                </span>
              </div>

              <div className="result-box">
                <label>
                  SUMMARY
                </label>

                <p>
                  {analysis.summary}
                </p>
              </div>

              <div className="result-box">
                <label>
                  ROOT CAUSE
                </label>

                <h3>
                  {analysis.rootCause}
                </h3>
              </div>

              <div className="confidence">
                <div>
                  <span>
                    AI Confidence
                  </span>

                  <strong>
                    {
                      analysis.confidence
                    }
                    %
                  </strong>
                </div>

                <div className="confidence-bar">
                  <span
                    style={{
                      width: `${analysis.confidence}%`,
                    }}
                  />
                </div>
              </div>

              <div className="result-box">
                <label>
                  RECOMMENDED ACTIONS
                </label>

                <ul>
                  {analysis.actions.map(
                    (a, i) => (
                      <li key={i}>
                        {a}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Services({
  services,
  refreshServices,
}) {
  return (
    <>
      <div className="page-intro">
        <div>
          <h2>
            Services
          </h2>

          <p>
            Monitor the health of
            your microservices.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={
            refreshServices
          }
        >
          ↻ Refresh Metrics
        </button>
      </div>

      <div className="services-grid">
        {services.map(
          (service) => (
            <div
              className="service-card"
              key={service.name}
            >
              <div className="service-card-top">
                <div className="service-large-icon">
                  ◈
                </div>

                <span
                  className={`status-pill ${service.status.toLowerCase()}`}
                >
                  {service.status}
                </span>
              </div>

              <h3>
                {service.name}
              </h3>

              <div className="service-metrics">
                <div>
                  <span>
                    Uptime
                  </span>

                  <strong>
                    {service.uptime}
                  </strong>
                </div>

                <div>
                  <span>
                    Latency
                  </span>

                  <strong>
                    {service.latency}
                  </strong>
                </div>

                <div>
                  <span>
                    Requests
                  </span>

                  <strong>
                    {service.requests}
                  </strong>
                </div>
              </div>

              <div className="uptime-line">
                <span
                  style={{
                    width:
                      service.uptime,
                  }}
                />
              </div>

              <div className="service-footer">
                <span>
                  Availability
                </span>

                <strong>
                  {service.uptime}
                </strong>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

function Alerts({
  alerts,
  setAlerts,
}) {
  const markAll = () =>
    setAlerts((current) =>
      current.map((a) => ({
        ...a,
        read: true,
      }))
    );

  const remove = (id) =>
    setAlerts((current) =>
      current.filter(
        (a) => a.id !== id
      )
    );

  return (
    <>
      <div className="page-intro">
        <div>
          <h2>
            Alerts
          </h2>

          <p>
            Stay informed about
            infrastructure events.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={markAll}
        >
          Mark all as read
        </button>
      </div>

      <div className="alerts-list">
        {alerts.length ? (
          alerts.map((a) => (
            <div
              className={`alert-card ${
                a.read
                  ? "read"
                  : ""
              }`}
              key={a.id}
            >
              <div
                className={`alert-icon ${a.type}`}
              >
                {a.icon}
              </div>

              <div className="alert-content">
                <strong>
                  {a.title}
                </strong>

                <p>
                  {a.message}
                </p>

                <small>
                  {a.time}
                </small>
              </div>

              {!a.read && (
                <span
                  className="unread-dot"
                  title="Unread"
                />
              )}

              <button
                className="more-button"
                onClick={() =>
                  remove(a.id)
                }
                title="Dismiss"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div>✓</div>

            <h3>
              All clear
            </h3>

            <p>
              No active
              notifications.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function Reports({
  incidents,
  stats,
  notify,
}) {
  const exportCSV = () => {
    const header = [
      "ID",
      "Service",
      "Severity",
      "Status",
      "Message",
      "Time",
    ];

    const rows = incidents.map(
      (i) => [
        i.id,
        i.service,
        i.severity,
        i.status,
        i.message,
        i.time,
      ]
    );

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (v) =>
              `"${String(v).replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        "a"
      );

    a.href = url;

    a.download = `devops-incident-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    a.click();

    URL.revokeObjectURL(
      url
    );

    notify(
      "CSV report exported."
    );
  };

  return (
    <>
      <div className="page-intro">
        <div>
          <h2>
            Reports
          </h2>

          <p>
            Analyze DevOps incident
            performance and export
            operational data.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={exportCSV}
        >
          ↓ Export CSV
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="📊"
          value="99.4%"
          title="Overall Availability"
          trend="+1.2%"
          description="This month"
        />

        <StatCard
          icon="⏱"
          value="18m"
          title="Mean Resolution Time"
          trend="-14%"
          description="Improved from last month"
        />

        <StatCard
          icon="🔍"
          value="84%"
          title="AI Confidence"
          trend="+7%"
          description="Average prediction confidence"
        />

        <StatCard
          icon="🚨"
          value={stats.total}
          title="Total Incidents"
          trend="-5%"
          description="Current reporting period"
        />
      </div>

      <div className="report-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Incident Performance
              </h3>

              <p>
                Current incident
                distribution
              </p>
            </div>
          </div>

          <IncidentTable
            incidents={incidents}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Severity Breakdown
              </h3>

              <p>
                Current incident mix
              </p>
            </div>
          </div>

          <SeverityBreakdown
            incidents={incidents}
          />
        </div>
      </div>
    </>
  );
}

function SeverityBreakdown({
  incidents,
}) {
  const levels = [
    "Critical",
    "High",
    "Medium",
    "Low",
  ];

  return (
    <div className="severity-chart">
      {levels.map((level) => {
        const count =
          incidents.filter(
            (i) =>
              i.severity ===
              level
          ).length;

        const width =
          incidents.length
            ? Math.max(
                5,
                (count /
                  incidents.length) *
                  100
              )
            : 5;

        return (
          <div
            className="severity-row"
            key={level}
          >
            <div>
              <span>
                {level}
              </span>

              <strong>
                {count}
              </strong>
            </div>

            <div className="severity-track">
              <span
                className={level.toLowerCase()}
                style={{
                  width: `${width}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/*
 * ============================================================
 * CORRECTED PROFILE COMPONENT
 * ============================================================
 */

function Profile({
  profile,
  setProfile,
  notify,
}) {
  const [editing, setEditing] =
    useState(false);

  const [draftProfile, setDraftProfile] =
    useState(profile);

  useEffect(() => {
    setDraftProfile(profile);
  }, [profile]);

  const startEditing = () => {
    setDraftProfile(profile);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraftProfile(profile);
    setEditing(false);
  };

  const save = () => {
    const cleanedProfile = {
      name:
        draftProfile.name.trim() ||
        "DevOps Engineer",

      email:
        draftProfile.email.trim() ||
        "devops@example.com",

      role:
        draftProfile.role.trim() ||
        "DevOps Engineer",

      team:
        draftProfile.team.trim() ||
        "Platform Engineering",
    };

    setProfile(
      cleanedProfile
    );

    /*
     * Explicit save to localStorage.
     *
     * This is the important part.
     */
    localStorage.setItem(
      "devops_profile",
      JSON.stringify(
        cleanedProfile
      )
    );

    /*
     * Verification in browser console.
     */
    console.log(
      "PROFILE SAVED:",
      localStorage.getItem(
        "devops_profile"
      )
    );

    setEditing(false);

    notify(
      "Profile updated successfully."
    );
  };

  const initials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .map((word) =>
        word.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <>
      <div className="page-intro">
        <div>
          <h2>
            My Profile
          </h2>

          <p>
            Manage your DevOps
            account information.
          </p>
        </div>

        {!editing ? (
          <button
            className="primary-button"
            onClick={
              startEditing
            }
          >
            ✎ Edit Profile
          </button>
        ) : (
          <div className="button-row">
            <button
              className="secondary-button"
              onClick={
                cancelEditing
              }
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={save}
            >
              ✓ Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {initials}
          </div>

          <div>
            <h2>
              {profile.name}
            </h2>

            <p>
              {profile.email}
            </p>

            <span className="online-status">
              ● Online
            </span>
          </div>
        </div>

        <div className="profile-details">
          <EditableDetail
            label="Full Name"
            value={
              draftProfile.name
            }
            editing={editing}
            onChange={(value) =>
              setDraftProfile({
                ...draftProfile,
                name: value,
              })
            }
          />

          <EditableDetail
            label="Email"
            value={
              draftProfile.email
            }
            editing={editing}
            onChange={(value) =>
              setDraftProfile({
                ...draftProfile,
                email: value,
              })
            }
          />

          <EditableDetail
            label="Role"
            value={
              draftProfile.role
            }
            editing={editing}
            onChange={(value) =>
              setDraftProfile({
                ...draftProfile,
                role: value,
              })
            }
          />

          <EditableDetail
            label="Team"
            value={
              draftProfile.team
            }
            editing={editing}
            onChange={(value) =>
              setDraftProfile({
                ...draftProfile,
                team: value,
              })
            }
          />

          <div className="profile-detail">
            <label>
              Access Level
            </label>

            <strong>
              Administrator
            </strong>
          </div>

          <div className="profile-detail">
            <label>
              Last Login
            </label>

            <strong>
              Today, 8:32 AM
            </strong>
          </div>
        </div>

        {editing && (
          <div className="profile-save-note">
            Changes are saved to this
            browser when you click
            <strong>
              {" "}
              Save Changes
            </strong>
            .
          </div>
        )}
      </div>
    </>
  );
}

function EditableDetail({
  label,
  value,
  editing,
  onChange,
}) {
  return (
    <div className="profile-detail">
      <label>
        {label}
      </label>

      {editing ? (
        <input
          className="inline-input"
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
        />
      ) : (
        <strong>
          {value}
        </strong>
      )}
    </div>
  );
}

function Settings({
  darkMode,
  setDarkMode,
  notify,
}) {
  const [
    emailNotifications,
    setEmailNotifications,
  ] = useState(true);

  const [
    autoAnalysis,
    setAutoAnalysis,
  ] = useState(true);

  const [
    monitoring,
    setMonitoring,
  ] = useState(true);

  const [modal, setModal] =
    useState(null);

  const toggle = (
    setter,
    value,
    label
  ) => {
    setter(!value);

    notify(
      `${label} ${
        !value
          ? "enabled"
          : "disabled"
      }.`
    );
  };

  return (
    <>
      <div className="page-intro">
        <div>
          <h2>
            Settings
          </h2>

          <p>
            Customize monitoring,
            notifications and account
            security.
          </p>
        </div>

        <span className="saved-pill">
          ● Settings active
        </span>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>
            General Settings
          </h3>

          <SettingRow
            title="Dark Mode"
            description="Use dark theme across the dashboard."
          >
            <Toggle
              on={darkMode}
              onClick={() =>
                toggle(
                  setDarkMode,
                  darkMode,
                  "Dark mode"
                )
              }
            />
          </SettingRow>

          <SettingRow
            title="Email Notifications"
            description="Receive incident notifications by email."
          >
            <Toggle
              on={
                emailNotifications
              }
              onClick={() =>
                toggle(
                  setEmailNotifications,
                  emailNotifications,
                  "Email notifications"
                )
              }
            />
          </SettingRow>

          <SettingRow
            title="AI Auto Analysis"
            description="Automatically analyze critical incidents."
          >
            <Toggle
              on={autoAnalysis}
              onClick={() =>
                toggle(
                  setAutoAnalysis,
                  autoAnalysis,
                  "AI auto analysis"
                )
              }
            />
          </SettingRow>

          <SettingRow
            title="Real-time Monitoring"
            description="Continuously monitor connected services."
          >
            <Toggle
              on={monitoring}
              onClick={() =>
                toggle(
                  setMonitoring,
                  monitoring,
                  "Real-time monitoring"
                )
              }
            />
          </SettingRow>
        </div>

        <div className="settings-section">
          <h3>
            Account Security
          </h3>

          <SettingRow
            title="Change Password"
            description="Update your account password."
          >
            <button
              className="secondary-button"
              onClick={() =>
                setModal(
                  "password"
                )
              }
            >
              Change
            </button>
          </SettingRow>

          <SettingRow
            title="Two-Factor Authentication"
            description="Add another layer of account security."
          >
            <button
              className="secondary-button"
              onClick={() =>
                setModal("2fa")
              }
            >
              Configure
            </button>
          </SettingRow>

          <SettingRow
            title="API Access"
            description="Manage API credentials."
          >
            <button
              className="secondary-button"
              onClick={() =>
                setModal("api")
              }
            >
              Manage
            </button>
          </SettingRow>
        </div>
      </div>

      {modal ===
        "password" && (
        <PasswordModal
          onClose={() =>
            setModal(null)
          }
          notify={notify}
        />
      )}

      {modal === "2fa" && (
        <InfoModal
          title="Two-Factor Authentication"
          text="Demo mode: connect your authentication provider here to enable OTP or authenticator-app verification."
          onClose={() =>
            setModal(null)
          }
        />
      )}

      {modal === "api" && (
        <ApiModal
          onClose={() =>
            setModal(null)
          }
          notify={notify}
        />
      )}
    </>
  );
}

function SettingRow({
  title,
  description,
  children,
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function Toggle({
  on,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`toggle ${
        on ? "on" : ""
      }`}
      onClick={onClick}
      aria-pressed={on}
    >
      <span />
    </button>
  );
}

function PasswordModal({
  onClose,
  notify,
}) {
  const [password, setPassword] =
    useState("");

  const [confirm, setConfirm] =
    useState("");

  const submit = (e) => {
    e.preventDefault();

    if (
      password.length < 6 ||
      password !== confirm
    ) {
      return;
    }

    onClose();

    notify(
      "Password updated successfully."
    );
  };

  return (
    <Modal
      title="Change Password"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <label>
          New password

          <input
            type="password"
            minLength="6"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />
        </label>

        <label>
          Confirm password

          <input
            type="password"
            value={confirm}
            onChange={(e) =>
              setConfirm(
                e.target.value
              )
            }
            required
          />
        </label>

        {confirm &&
          password !==
            confirm && (
            <div className="form-message error">
              Passwords do not
              match.
            </div>
          )}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            disabled={
              password.length <
                6 ||
              password !==
                confirm
            }
          >
            Update Password
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ApiModal({
  onClose,
  notify,
}) {
  const [key, setKey] =
    useState(
      "devops-demo-key"
    );

  return (
    <Modal
      title="API Access"
      onClose={onClose}
    >
      <div className="api-box">
        <label>
          API Base URL
        </label>

        <code>
          {API_BASE}
        </code>

        <label>
          AI Base URL
        </label>

        <code>
          {AI_BASE}
        </code>

        <label>
          Demo API Key
        </label>

        <div className="api-key">
          <input
            value={key}
            onChange={(e) =>
              setKey(
                e.target.value
              )
            }
          />

          <button
            className="secondary-button"
            onClick={() => {
              navigator.clipboard?.writeText(
                key
              );

              notify(
                "API key copied."
              );
            }}
          >
            Copy
          </button>
        </div>
      </div>

      <div className="modal-actions">
        <button
          className="primary-button"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </Modal>
  );
}

function InfoModal({
  title,
  text,
  onClose,
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
    >
      <p className="modal-info">
        {text}
      </p>

      <div className="modal-actions">
        <button
          className="primary-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (
          e.target ===
          e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            {title}
          </h3>

          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Toast({
  message,
  type,
}) {
  return (
    <div
      className={`toast ${type}`}
    >
      <span>
        {type === "error"
          ? "!"
          : type ===
            "warning"
          ? "⚠"
          : "✓"}
      </span>

      {message}
    </div>
  );
}

export default App;