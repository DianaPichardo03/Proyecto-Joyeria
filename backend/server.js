const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ======================
// DB
// ======================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "broqueles",
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("DB conectada 🟢");
});

// ======================
// MULTER
// ======================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ======================
// ADMIN
// ======================
const ADMIN_USER = {
  usuario: "admin",
  password: bcrypt.hashSync("1234", 8),
};

// ======================
// LOGIN
// ======================
app.post("/api/login", (req, res) => {
  const { usuario, password } = req.body;

  if (usuario !== ADMIN_USER.usuario) {
    return res.status(401).json({ success: false });
  }

  const valid = bcrypt.compareSync(password, ADMIN_USER.password);

  if (!valid) {
    return res.status(401).json({ success: false });
  }

  const token = jwt.sign({ usuario }, "SECRET123", {
    expiresIn: "1h",
  });

  res.json({ success: true, token });
});

// ======================
// TOKEN
// ======================
const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];

  if (!header) {
    return res.status(403).json({ error: "No token" });
  }

  try {
    const token = header.replace("Bearer ", ""); // 🔥 FIX CLAVE
    jwt.verify(token, "SECRET123");
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

// ======================
// PRODUCTOS
// ======================

// GET
app.get("/api/productos", (req, res) => {
  db.query("SELECT * FROM productos", (err, r) => {
    if (err) return res.status(500).json(err);
    res.json(r);
  });
});

// AGREGAR
app.post(
  "/api/productos",
  verifyToken,
  upload.single("imagen"),
  (req, res) => {
    const { nombre, precio, stock } = req.body;
    const imagen = req.file ? req.file.filename : "";

    db.query(
      "INSERT INTO productos (nombre,precio,stock,imagen) VALUES (?,?,?,?)",
      [nombre, precio, stock, imagen],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ ok: true });
      }
    );
  }
);

// EDITAR 🔥 FIX (FALTABA TOKEN)
app.put("/api/productos/:id", verifyToken, (req, res) => {
  const { nombre, precio, stock } = req.body;

  db.query(
    "UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?",
    [nombre, precio, stock, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ ok: true });
    }
  );
});

// IMAGEN
app.put(
  "/api/productos/imagen/:id",
  verifyToken,
  upload.single("imagen"),
  (req, res) => {
    const imagen = req.file.filename;

    db.query(
      "UPDATE productos SET imagen=? WHERE id=?",
      [imagen, req.params.id],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ ok: true });
      }
    );
  }
);

// ELIMINAR 🔥 FIX (YA ESTABA BIEN)
app.delete("/api/productos/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM productos WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ ok: true });
  });
});

// ======================
// COMPRA
// ======================
app.post("/api/comprar", (req, res) => {
  const { carrito, nombre, telefono, total } = req.body;

  carrito.forEach((item) => {
    db.query(
      "INSERT INTO pedidos (nombre, telefono, producto, cantidad, total) VALUES (?,?,?,?,?)",
      [nombre, telefono, item.nombre, item.cantidad, total],
      (err) => {
        if (err) console.log(err);
      }
    );

    db.query(
      "UPDATE productos SET stock = stock - ? WHERE id=?",
      [item.cantidad, item.id],
      (err) => {
        if (err) console.log(err);
      }
    );
  });

  res.json({ ok: true });
});

// ======================
// PEDIDOS
// ======================
app.get("/api/pedidos", (req, res) => {
  db.query("SELECT * FROM pedidos ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.delete("/api/pedidos/:id", (req, res) => {
  db.query(
    "DELETE FROM pedidos WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ ok: true });
    }
  );
});

// ======================
// SERVER
// ======================
app.listen(3001, () => console.log("Server listo 🚀"));