const fs = require("fs");
const path = require("path");

const apps = [
  { name: "Admin", file: "apps/admin/admin-portal/src/app/app.tsx" },
  { name: "Partner", file: "apps/partner/partner-portal/src/app/app.tsx" },
  { name: "Rider", file: "apps/rider/rider-portal/src/app/app.tsx" }
];

const getAuthComponent = (name) => `
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  
  const handleLogin = (e: any) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("${name.toLowerCase()}_loggedIn", "true");
      onLogin();
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "white", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", color: "#0054A6", marginBottom: "2rem", fontFamily: "sans-serif" }}>${name} Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "sans-serif" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#475569", fontWeight: 500 }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#475569", fontWeight: 500 }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none" }} />
          </div>
          <button type="submit" style={{ background: "#0054A6", color: "white", padding: "1rem", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", marginTop: "1rem" }}>
            Login
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#64748b", fontSize: "0.9rem", fontFamily: "sans-serif" }}>
          Don\\'t have an account? <span style={{ color: "#0054A6", cursor: "pointer", fontWeight: 600 }}>Sign up</span>
        </div>
      </div>
    </div>
  );
}
`;

for (const app of apps) {
  const p = path.join(process.cwd(), app.file);
  if (!fs.existsSync(p)) {
    console.log(p + " missing");
    continue;
  }
  let content = fs.readFileSync(p, "utf-8");
  if (content.includes("LoginScreen")) {
    console.log(app.name + " already patched");
    continue;
  }
  
  content = content.replace("export default function App() {", "function MainApp() {");
  
  const authLogic = getAuthComponent(app.name) + `
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const logged = localStorage.getItem("${app.name.toLowerCase()}_loggedIn");
    if (logged === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <MainApp />;
}
`;

  content = content.replace("export default App;", authLogic);
  fs.writeFileSync(p, content, "utf-8");
  console.log("Patched " + app.name);
}
