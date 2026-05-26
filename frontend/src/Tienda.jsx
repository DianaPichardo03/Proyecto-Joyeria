import { useState, useEffect } from "react";
import axios from "axios";
import fondo from "./assets/fondo.png";

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const [vista, setVista] = useState("home");
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarContacto, setMostrarContacto] = useState(false);

  // 💳 pago
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [cvv, setCvv] = useState("");
  const [fecha, setFecha] = useState("");

  // 🌙 modo oscuro
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark") === "true"
  );

  const toggleDark = () => {
    const value = !darkMode;
    setDarkMode(value);
    localStorage.setItem("dark", value);
  };

  // ======================
  // PRODUCTOS
  // ======================
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/productos")
      .then((res) => setProductos(res.data))
      .catch((err) => console.log(err));
  }, []);

  // ======================
  // AGREGAR CARRITO
  // ======================
  const agregar = (p) => {
    const existe = carrito.find((i) => i.id === p.id);

    const cantidad = existe ? existe.cantidad : 0;

    // 🚫 validar stock
    if (cantidad >= p.stock) {
      alert("Sin stock disponible ❌");
      return;
    }

    setCarrito((prev) => {
      if (existe) {
        return prev.map((i) =>
          i.id === p.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }

      return [...prev, {
        id: p.id,              
        nombre: p.nombre,
        precio: p.precio,
        cantidad: 1
      }];
    });
  };

  // ======================
  // ELIMINAR
  // ======================
  const eliminar = (id) => {
    setCarrito((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? { ...i, cantidad: i.cantidad - 1 }
            : i
        )
        .filter((i) => i.cantidad > 0)
    );
  };

  // ======================
  // TOTAL
  // ======================
  const total = carrito.reduce(
    (acc, i) => acc + i.precio * i.cantidad,
    0
  );

  // ======================
  // WHATSAPP
  // ======================
  const enviarWhatsApp = () => {
    let mensaje = "Hola, quiero hacer un pedido:%0A";

    carrito.forEach((p) => {
      mensaje += `- ${p.nombre} x${p.cantidad}%0A`;
    });

    mensaje += `%0ATotal: $${total}`;
    mensaje += `%0ANombre: ${nombre}`;
    mensaje += `%0ATeléfono: ${telefono}`;

    const url = `https://wa.me/527331170412?text=${mensaje}`;

    window.open(url, "_blank");
  };

  // ======================
  // HOME
  // ======================
  if (vista === "home") {
    return (
      <div
        style={{
          height: "100vh",
          backgroundImage: `url(${fondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textShadow: "2px 2px 5px black",
          position: "relative",
        }}
      >
        {/* CENTRO */}
        <div style={{ textAlign: "center" }}>
          <h1> Joyeria Diana </h1>

          <button
            style={{
              padding: "12px 25px",
              borderRadius: "30px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
            onClick={() => setVista("tienda")}
          >
            🛍️ Tienda
          </button>
        </div>

        {/* ADMIN */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
          }}
        >
          <button
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              cursor: "pointer",
              border: "none",
            }}
            onClick={() =>
              (window.location.href = "/admin")
            }
          >
            👨‍💼
          </button>
        </div>

        {/* CONTACTO + DARK */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* CONTACTO */}
          <div style={{ position: "relative" }}>
            <button
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                cursor: "pointer",
                border: "none",
              }}
              onClick={() =>
                setMostrarContacto(!mostrarContacto)
              }
            >
              📞
            </button>

            {mostrarContacto && (
              <div
                style={{
                  position: "absolute",
                  bottom: 60,
                  right: 0,
                  background: "white",
                  color: "black",
                  padding: 12,
                  borderRadius: 10,
                  width: 170,
                  zIndex: 999,
                }}
              >
                <a
                  href="https://wa.me/527331170412"
                  target="_blank"
                  style={{
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  📱 WhatsApp
                </a>

                <a
                  href="https://www.facebook.com/joyeria.diana.393072"
                  target="_blank"
                >
                  📘 Facebook
                </a>
              </div>
            )}
          </div>

          {/* DARK MODE */}
          <button
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              cursor: "pointer",
              border: "none",
            }}
            onClick={toggleDark}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    );
  }

  // ======================
  // TIENDA
  // ======================
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        backgroundColor: darkMode ? "#111" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      {/* PRODUCTOS */}
      <div style={{ flex: 3 }}>
        <h1>Productos 💎</h1>

        <button onClick={() => setVista("home")}>
          ⬅ Volver
        </button>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {productos.map((p) => (
            <div
              key={p.id}
              style={{
                width: 200,
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 10,
                opacity: p.stock <= 0 ? 0.5 : 1,
              }}
            >
              <img
                src={`http://localhost:3001/uploads/${p.imagen}`}
                style={{
                  width: "100%",
                  borderRadius: 10,
                }}
              />

              <h3>{p.nombre}</h3>

              <p>${p.precio}</p>

              <p>Stock: {p.stock}</p>

              <button
                disabled={p.stock <= 0}
                onClick={() => agregar(p)}
              >
                {p.stock <= 0
                  ? "SIN STOCK"
                  : "Agregar 🛒"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CARRITO */}
      <div style={{ flex: 1 }}>
        <h2>Carrito 🛒</h2>

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
        />

        <input
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) =>
            setTelefono(e.target.value)
          }
        />

        {carrito.map((p) => (
          <div key={p.id}>
            <p>
              {p.nombre} x{p.cantidad}
            </p>

            <p>${p.precio * p.cantidad}</p>

            <button onClick={() => eliminar(p.id)}>
              Quitar
            </button>
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <button onClick={() => setMostrarPago(true)}>
          💳 Pagar
        </button>

        {mostrarPago && (
          <div>
            <h3>Pago 💳</h3>

            <input
              placeholder="Número tarjeta"
              maxLength={16}
              value={numeroTarjeta}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setNumeroTarjeta(value);
              }}
            />

            <input
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />

            <input
              placeholder="MM/AA"
              maxLength={5}
              value={fecha}
              onChange={(e) => {

                let value = e.target.value.replace(/\D/g, "");

                if (value.length >= 3) {
                  value =
                    value.slice(0, 2) +
                    "/" +
                    value.slice(2, 4);
                }

                setFecha(value);
              }}
            />

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

            <button onClick={enviarWhatsApp}>
              📲 WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tienda;