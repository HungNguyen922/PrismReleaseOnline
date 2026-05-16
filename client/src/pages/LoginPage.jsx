// client/src/pages/LoginPage.jsx
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleAuth(endpoint) {
    const res = await fetch(`http://localhost:4000/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    // ⭐ Save token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // ⭐ Redirect to home or deck select
    window.location.href = "/deckselect";
  }

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Login or Register</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: "20px" }}
      />

      <button
        onClick={() => handleAuth("login")}
        style={{ width: "100%", marginBottom: "10px" }}
      >
        Login
      </button>

      <button
        onClick={() => handleAuth("register")}
        style={{ width: "100%" }}
      >
        Register
      </button>
    </div>
  );
}
