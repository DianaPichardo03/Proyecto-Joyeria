import { useState, useEffect } from "react";
import axios from "axios";

function Admin() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [imagen, setImagen] = useState(null);

  const [productos, setProductos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const [pedidos, setPedidos] = useState([]);
  const [mostrarPedidos, setMostrarPedidos] = useState(false);

  const token = localStorage.getItem("token");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark") === "true"
  );

  const toggleDark = () => {
    const value = !darkMode;
    setDarkMode(value);
    localStorage.setItem("dark", value);
  };

  
  const cargarProductos = () => {
    axios
      .get("https://proyecto-joyeria-50z0.onrender.com/api/productos")
      .then((res) => setProductos(res.data));
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  
  const cargarPedidos = () => {
    axios
      .get("https://proyecto-joyeria-50z0.onrender.com/api/pedidos")
      .then((res) => setPedidos(res.data));
  };

  const eliminarPedido = async (id) => {
    await axios.delete(`https://proyecto-joyeria-50z0.onrender.com/api/pedidos/${id}`);
    cargarPedidos();
  };

  
  const marcarEntregado = async (id) => {
    await axios.put(`https://proyecto-joyeria-50z0.onrender.com/api/pedidos/entregado/${id}`);
    cargarPedidos();
  };

 
  const agregar = async () => {
    const form = new FormData();

    form.append("nombre", nombre);
    form.append("precio", Number(precio));
    form.append("stock", Number(stock));
    form.append("imagen", imagen);

    await axios.post(
      "https://proyecto-joyeria-50z0.onrender.com/api/productos",
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
      }
    );

    limpiar();
    cargarProductos();
  };

  
  const editar = async () => {
    await axios.put(
      `https://proyecto-joyeria-50z0.onrender.com/api/productos/${editandoId}`,
      {
        nombre,
        precio: Number(precio),
        stock: Number(stock),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
      }
    );

    limpiar();
    cargarProductos();
  };

  
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;

    await axios.delete(
      `https://proyecto-joyeria-50z0.onrender.com/api/productos/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
      }
    );

    cargarProductos();
  };


  const limpiar = () => {
    setNombre("");
    setPrecio("");
    setStock("");
    setImagen(null);
    setEditandoId(null);
  };


  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    window.location.href = "/";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 20,
        background: darkMode ? "#111" : "#fff",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => (window.location.href = "/")}>
            ⬅ Inicio
          </button>

          <button onClick={toggleDark}>
            {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
        </div>

        <button
          onClick={cerrarSesion}
          style={{
            background: "#ff4d4d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 10,
          }}
        >
          🚪 Salir
        </button>
      </div>

      <h1>Panel Admin 👨‍💼</h1>

      
      <button
        onClick={() => {
          cargarPedidos();
          setMostrarPedidos(!mostrarPedidos);
        }}
      >
        📦 Ver pedidos
      </button>

      {mostrarPedidos && (
        <div style={{ marginBottom: 30 }}>
          {pedidos.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
                borderRadius: 10,
              }}
            >
              <p><b>Cliente:</b> {p.nombre}</p>
              <p><b>Tel:</b> {p.telefono}</p>
              <p><b>Producto:</b> {p.producto}</p>
              <p><b>Cantidad:</b> {p.cantidad}</p>
              <p><b>Total:</b> ${p.total}</p>

              
              <button
                onClick={() => marcarEntregado(p.id)}
                style={{
                  marginTop: 10,
                  background: p.entregado ? "green" : "#ff9800",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: 8,
                }}
              >
                {p.entregado ? "✔ Entregado" : "Marcar entregado"}
              </button>

              <button
                onClick={() => eliminarPedido(p.id)}
                style={{
                  marginLeft: 10,
                  background: "#ff4d4d",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: 8,
                }}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      
      <div
        style={{
          width: 320,
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 15,
          marginBottom: 30,
          background: darkMode ? "#1e1e1e" : "#f8f8f8",
        }}
      >
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <input
          type="file"
          onChange={(e) => setImagen(e.target.files[0])}
        />

        {editandoId ? (
          <button onClick={editar}>
            💾 Guardar cambios
          </button>
        ) : (
          <button onClick={agregar}>
            ➕ Agregar producto
          </button>
        )}
      </div>

      
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {productos.map((p) => (
          <div
            key={p.id}
            style={{
              width: 220,
              border: "1px solid #ccc",
              borderRadius: 15,
              padding: 15,
              background: darkMode ? "#1e1e1e" : "#fff",
            }}
          >
            <img
              src={`https://proyecto-joyeria-50z0.onrender.com/uploads/${p.imagen}`}
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
              }}
            />

            <h3>{p.nombre}</h3>
            <p>${p.precio}</p>
            <p>Stock: {p.stock}</p>

            <button onClick={() => {
              setEditandoId(p.id);
              setNombre(p.nombre);
              setPrecio(p.precio);
              setStock(p.stock);
            }}>
              ✏️
            </button>

            <button onClick={() => eliminar(p.id)}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;