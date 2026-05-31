import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[Lumina] Uncaught render error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "Inter, sans-serif", background: "#f8f9ff", padding: 32,
          textAlign: "center",
        }}>
          <img src="/lumina-logo.png" alt="Lumina" style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 24 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280", maxWidth: 360, marginBottom: 24 }}>
            Lumina hit an unexpected error. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#4f46e5", color: "#fff", border: "none",
              borderRadius: 999, padding: "10px 24px", fontSize: 14,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Refresh
          </button>
          {(
            <pre style={{
              marginTop: 24, fontSize: 11, color: "#ef4444",
              background: "#fff1f1", padding: 12, borderRadius: 8,
              maxWidth: 600, overflowX: "auto", textAlign: "left",
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
