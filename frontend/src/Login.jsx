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
        navigate("/panel");
      }
    } catch {
      alert("Login incorrecto ❌");
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <h2>Login Admin 👨‍💼</h2>

      <input
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Entrar</button>
    </div>
  );
}