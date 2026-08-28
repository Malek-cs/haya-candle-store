"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Session is handled via httpOnly cookie from the server
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password!");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="admin-logo">
          <h2 style={{ fontSize: "2rem" }}>🕯️</h2>
          <h2 className="login-title">Admin Login</h2>
          <p className="login-sub">Welcome back to Haya Store</p>
        </div>

        {error && (
          <p
            className="login-error"
            style={{
              background: "#2a1010",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            {error}
          </p>
        )}

        <div className="login-form">
          <input
            type="email"
            className="login-input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}