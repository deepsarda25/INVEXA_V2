import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../hooks/useTheme";
import { ThemeToggleIcon } from "./ThemeToggleIcon";
import { PasswordField } from "./PasswordField";

export function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginMethod, setLoginMethod] = useState<"password" | "accessKey">("password");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [confirmAccessKey, setConfirmAccessKey] = useState("");
  const [loginSecret, setLoginSecret] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAccessKey("");
    setConfirmAccessKey("");
    setLoginSecret("");
    setError(null);
  }, []);

  const { login, register } = useAuthStore();

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const accessKeysMatch = confirmAccessKey.length === 0 || accessKey === confirmAccessKey;
  const accessKeyValid = accessKey.length === 0 || /^\d{4}$/.test(accessKey);

  const registerDisabled =
    loading ||
    password.length < 8 ||
    password.length > 128 ||
    password !== confirmPassword ||
    !/^\d{4}$/.test(accessKey) ||
    accessKey !== confirmAccessKey;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (tab === "login") {
        if (loginMethod === "password") {
          await login({ usernameOrEmail: username, password: loginSecret });
        } else {
          await login({ usernameOrEmail: username, accessKey: loginSecret });
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error("Password and confirm password do not match.");
        }
        if (!/^\d{4}$/.test(accessKey)) {
          throw new Error("Access Key must be exactly 4 digits.");
        }
        if (accessKey !== confirmAccessKey) {
          throw new Error("Access Key and confirm Access Key do not match.");
        }
        await register({ username, email, password, confirmPassword, accessKey, confirmAccessKey });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (newTab: "login" | "register") => {
    setTab(newTab);
    setError(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAccessKey("");
    setConfirmAccessKey("");
    setLoginSecret("");
  };

  return (
    <div className="auth-layout">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 10 }}
      >
        <ThemeToggleIcon theme={theme} />
      </button>

      {/* Left side: Terminal branding */}
      <div className="auth-sidebar glass-panel">
        <div className="auth-form-container">
          <div style={{ marginBottom: "3rem" }}>
            <img
              src={theme === "dark" ? "/assets/invexa-logo-dark.png" : "/assets/invexa-logo-light.png"}
              alt="Invexa"
              style={{ height: "3.5rem", width: "3.5rem", borderRadius: "0.5rem", objectFit: "cover", marginBottom: "0.75rem" }}
            />
            <h1 className="display-lg">Invexa</h1>
            <p className="label-sm" style={{ marginTop: "0.5rem" }}>Trade · Invest · Learn</p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => handleTabClick("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => handleTabClick("register")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Honeypot inputs to trick browser autofill */}
            <input type="text" name="username" autoComplete="off" style={{ display: "none" }} />
            <input type="password" name="password" autoComplete="off" style={{ display: "none" }} />

            {tab === "register" && (
              <label className="form-label">
                Email Address
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@invexa.app"
                  autoComplete="off"
                  required
                />
              </label>
            )}

            <label className="form-label">
              Terminal Identity
              <input
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                autoComplete="off"
                required
              />
            </label>

            {tab === "register" && (
              <>
                <div className="form-label" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  Password
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    style={{ borderColor: password.length > 0 && (password.length < 8 || password.length > 128) ? "var(--val-down)" : undefined }}
                  />
                  {(isPasswordFocused || password.length > 0) && (
                    <ul className="label-sm" style={{ listStyle: "none", padding: "0.5rem 0 0 0.5rem", margin: 0, color: "var(--on-surface-variant)" }}>
                      <li style={{ color: password.length >= 8 ? "var(--val-up)" : password.length > 0 ? "var(--val-down)" : "inherit" }}>• Must be at least 8 characters long</li>
                      <li style={{ color: password.length <= 128 ? "var(--val-up)" : password.length > 0 ? "var(--val-down)" : "inherit" }}>• Must be at most 128 characters long</li>
                    </ul>
                  )}
                </div>

                <div className="form-label" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  Confirm Password
                  <PasswordField
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    style={{ borderColor: !passwordsMatch ? "var(--val-down)" : undefined }}
                  />
                  {!passwordsMatch && (
                    <span className="label-sm" style={{ color: "var(--val-down)", paddingLeft: "0.5rem" }}>Passwords do not match</span>
                  )}
                </div>

                <div className="form-label" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  Access Key (4-digit PIN)
                  <PasswordField
                    value={accessKey}
                    onChange={(v) => setAccessKey(v.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    style={{ letterSpacing: "0.4em", borderColor: !accessKeyValid ? "var(--val-down)" : undefined }}
                  />
                  <span className="label-sm" style={{ paddingLeft: "0.5rem", color: "var(--on-surface-variant)" }}>
                    A quick 4-digit PIN you can use to sign in instead of your password.
                  </span>
                </div>

                <div className="form-label" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  Confirm Access Key
                  <PasswordField
                    value={confirmAccessKey}
                    onChange={(v) => setConfirmAccessKey(v.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    style={{ letterSpacing: "0.4em", borderColor: !accessKeysMatch ? "var(--val-down)" : undefined }}
                  />
                  {!accessKeysMatch && (
                    <span className="label-sm" style={{ color: "var(--val-down)", paddingLeft: "0.5rem" }}>Access Keys do not match</span>
                  )}
                </div>
              </>
            )}

            {tab === "login" && (
              <>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => { setLoginMethod("password"); setLoginSecret(""); }}
                    style={{
                      flex: 1,
                      background: loginMethod === "password" ? "var(--primary-container)" : "var(--surface-variant)",
                      color: loginMethod === "password" ? "var(--on-primary)" : "var(--on-surface-variant)",
                      border: "none"
                    }}
                  >
                    Use Password
                  </button>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => { setLoginMethod("accessKey"); setLoginSecret(""); }}
                    style={{
                      flex: 1,
                      background: loginMethod === "accessKey" ? "var(--primary-container)" : "var(--surface-variant)",
                      color: loginMethod === "accessKey" ? "var(--on-primary)" : "var(--on-surface-variant)",
                      border: "none"
                    }}
                  >
                    Use Access Key
                  </button>
                </div>

                <label className="form-label">
                  {loginMethod === "password" ? "Password" : "Access Key"}
                  <PasswordField
                    value={loginSecret}
                    onChange={(v) => setLoginSecret(loginMethod === "accessKey" ? v.replace(/\D/g, "").slice(0, 4) : v)}
                    placeholder={loginMethod === "password" ? "••••••••" : "••••"}
                    maxLength={loginMethod === "accessKey" ? 4 : undefined}
                    inputMode={loginMethod === "accessKey" ? "numeric" : "text"}
                    autoComplete="current-password"
                    required
                    style={loginMethod === "accessKey" ? { letterSpacing: "0.4em" } : undefined}
                  />
                </label>
              </>
            )}

            {error && <div className="val-down label-sm" style={{ padding: "0.5rem 0", textTransform: "none" }}>Execution Failed: {error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={tab === "register" ? registerDisabled : loading}
              style={{ marginTop: "1rem" }}
            >
              {loading ? "Initializing..." : "Initialize Session"}
            </button>
          </form>

          <div className="label-sm" style={{ marginTop: "3rem", color: "var(--on-surface-variant)", opacity: 0.7 }}>
            Trade risk-free with virtual currency. Every account starts with a ₹10,00,000 practice balance.
          </div>
        </div>
      </div>

      {/* Right side: Vibe area */}
      <div className="auth-hero">
        <div style={{ maxWidth: "600px", zIndex: 10 }}>
          <div className="badge badge-filled" style={{ marginBottom: "1rem" }}>Invexa</div>
          <h2 className="display-lg" style={{ marginBottom: "1.5rem" }}>
            Trade, Invest, <br /><span style={{ color: "var(--primary-container)" }}>Learn.</span>
          </h2>
          <p className="body-md" style={{ maxWidth: "480px" }}>
            Invexa is a virtual trading terminal for learning the markets without the risk — place real-time
            buy and sell orders on live-tracked stocks, build a watchlist, and study your portfolio's performance,
            all with practice currency. No real money, no real risk — just real market behavior.
          </p>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="label-sm" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem 4rem", display: "flex", justifyContent: "space-between", zIndex: 20 }}>
        <div>© 2026 Invexa. No real currency is traded.</div>
        <div style={{ display: "flex", gap: "2rem" }}>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Risk Disclosure</span>
        </div>
      </div>
    </div>
  );
}
