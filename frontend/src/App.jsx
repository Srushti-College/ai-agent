import { useEffect, useState } from "react";

import {
  Bot,
  MessageSquare,
  Users,
  History,
  Settings,
  Info,
  Bell,
  Zap,
  Activity,
  Database,
  Send,
  Paperclip,
  CheckCircle2,
  Server,
  Clock3,
  BarChart3,
  Cog,
} from "lucide-react";

const API_BASE = "/api";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({
    backend: "Checking...",
    database: "Checking...",
    agent: "Checking...",
    response_time: "--",
    uptime: "--",
  });

  const [activities, setActivities] = useState([
    {
      icon: "check",
      title: "System health check",
      time: "Just now",
    },
    {
      icon: "chat",
      title: "Ready for your query",
      time: "1 min ago",
    },
    {
      icon: "action",
      title: "Agent initialized",
      time: "2 min ago",
    },
  ]);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const response = await fetch(`${API_BASE}/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        backend: "Unavailable",
        database: "Unavailable",
        agent: "Offline",
        response_time: "--",
        uptime: "--",
      });
    }
  }

  async function sendMessage(customMessage = null) {
    const text = customMessage || message;

    if (!text.trim()) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        type: "user",
        text,
      },
    ]);

    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          type: "agent",
          text: data.response,
        },
      ]);

      setActivities((previous) => [
        {
          icon: "chat",
          title: "Processed user query",
          time: "Just now",
        },
        ...previous.slice(0, 2),
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          type: "agent",
          text: "Unable to contact the backend API.",
        },
      ]);
    }
  }

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="robot-logo">
            <Bot size={42} />
          </div>

          <h1>AI Agent</h1>
          <h1>Assistant</h1>
        </div>

        <nav>

          <button className="nav-item active">
            <MessageSquare size={21} />
            Chat
          </button>

          <button className="nav-item">
            <Users size={21} />
            Agents
          </button>

          <button className="nav-item">
            <History size={21} />
            History
          </button>

          <button className="nav-item">
            <Settings size={21} />
            Settings
          </button>

          <button className="nav-item">
            <Info size={21} />
            About
          </button>

        </nav>

        <div className="system-online">
          <div className="online-dot"></div>

          <div>
            <strong>System Online</strong>
            <span>v1.0.0</span>
          </div>
        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {/* TOP BAR */}
        <header className="topbar">

          <div></div>

          <div className="user-section">
            <Bell size={22} />

            <div className="avatar">S</div>

            <span>Srushti</span>

            <span>⌄</span>
          </div>

        </header>

        {/* HERO */}
        <section className="hero">

          <div className="hero-robot">
            <Bot size={100} />
          </div>

          <div className="hero-text">

            <h2>
              Hello, Srushti! 👋
            </h2>

            <p>
              I'm your AI Agent. How can I help you today?
            </p>

          </div>

          <div className="hero-badges">

            <div>
              <Zap size={17} />
              Smart Actions
            </div>

            <div>
              <BarChart3 size={17} />
              Real-time Insights
            </div>

            <div>
              <CheckCircle2 size={17} />
              Powered by AI
            </div>

          </div>

        </section>

        {/* CONTENT */}
        <section className="content-grid">

          {/* CHAT */}
          <div className="chat-panel">

            <div className="chat-body">

              {messages.length === 0 ? (

                <div className="welcome-message">

                  <div className="user-message">
                    Show me the system status
                    <div className="avatar small">S</div>
                  </div>

                  <div className="agent-message">

                    <div className="agent-icon">
                      <Bot size={26} />
                    </div>

                    <div>

                      <p>
                        Here is the current system status:
                      </p>

                      <div className="status-list">

                        <div>
                          <CheckCircle2 />
                          Backend API: {status.backend}
                        </div>

                        <div>
                          <CheckCircle2 />
                          Database: {status.database}
                        </div>

                        <div>
                          <CheckCircle2 />
                          AI Agent: {status.agent}
                        </div>

                        <div>
                          <CheckCircle2 />
                          Response Time: {status.response_time}
                        </div>

                      </div>

                      <div className="uptime">
                        {status.uptime || "99.9%"} Uptime
                      </div>

                    </div>

                  </div>

                </div>

              ) : (

                messages.map((item, index) => (

                  <div
                    key={index}
                    className={
                      item.type === "user"
                        ? "user-message"
                        : "agent-message"
                    }
                  >

                    {item.type === "agent" && (
                      <div className="agent-icon">
                        <Bot size={26} />
                      </div>
                    )}

                    <div className="message-text">
                      {item.text}
                    </div>

                    {item.type === "user" && (
                      <div className="avatar small">S</div>
                    )}

                  </div>

                ))

              )}

            </div>

            {/* INPUT */}
            <div className="chat-input">

              <button>
                <Paperclip size={21} />
              </button>

              <input
                type="text"
                value={message}
                placeholder="Ask anything..."
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                className="send-button"
                onClick={() => sendMessage()}
              >
                <Send size={21} />
              </button>

            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="right-column">

            {/* AGENT STATUS */}
            <div className="card">

              <div className="card-title">

                <h3>
                  <span className="green-dot"></span>
                  Agent Status
                </h3>

                <span className="active-badge">
                  Active
                </span>

              </div>

              <div className="agent-running">
                <Activity size={36} />
                <span>AI Agent is running smoothly!</span>
              </div>

              <div className="metrics">

                <div>
                  <Clock3 />
                  <span>Response Time</span>
                  <strong>
                    {status.response_time}
                  </strong>
                </div>

                <div>
                  <BarChart3 />
                  <span>Requests Today</span>
                  <strong>1.2K</strong>
                </div>

              </div>

            </div>

            {/* RECENT ACTIVITY */}
            <div className="card">

              <div className="card-title">

                <h3>Recent Activity</h3>

                <span className="view-all">
                  View All →
                </span>

              </div>

              <div className="activities">

                {activities.map((activity, index) => (

                  <div className="activity" key={index}>

                    <div className="activity-icon">

                      {activity.icon === "check" && (
                        <CheckCircle2 />
                      )}

                      {activity.icon === "chat" && (
                        <MessageSquare />
                      )}

                      {activity.icon === "action" && (
                        <Cog />
                      )}

                    </div>

                    <div>
                      <strong>
                        {activity.title}
                      </strong>

                      <span>
                        {activity.time}
                      </span>
                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* FOOTER CARD */}
            <div className="ai-card">

              <div className="rocket">
                🚀
              </div>

              <div>
                <strong>
                  Built with ❤️ using
                </strong>

                <span>
                  AI + DevOps Magic!
                </span>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;
