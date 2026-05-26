import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/login", {
        usuario,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("admin", "true");
        navigate("/panel");
      }
    } catch {
      alert("Login incorrecto ❌");
    }
  };

 return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#111",
      padding: 20,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 350,
        background: "white",
        padding: 30,
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        gap: 15,
        boxShadow: "0 0 20px rgba(0,0,0,0.3)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        💎 Login Admin
      </h2>

      <input
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
        }}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={login}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "none",
          background: "black",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Entrar
      </button>
    </div>
  </div>
);
}