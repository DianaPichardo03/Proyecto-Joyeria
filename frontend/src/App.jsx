import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tienda from "./Tienda";
import Login from "./Login";
import Admin from "./Admin";

const token = localStorage.getItem("token");

function App() {
  <button
  onClick={async () => {

    try {

      await axios.post(
        "http://localhost:3001/api/comprar",
        {
          carrito,
          nombre,
          telefono,
          total,
        }
      );

      alert("Compra realizada 💎");

      setCarrito([]);
      setMostrarPago(false);

    } catch (err) {

      alert("Error al guardar compra");

    }

  }}
>
  Confirmar
</button>
  return (
    <BrowserRouter>
      <Routes>

        {/* TIENDA */}
        <Route path="/" element={<Tienda />} />

        {/* ADMIN */}
        <Route path="/admin" element={<Login />} />
        <Route path="/panel" element={<Admin />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;