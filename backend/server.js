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


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },

});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("DB conectada 🟢");
});


const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


const ADMIN_USER = {
  usuario: "admin",
  password: bcrypt.hashSync("1234", 8),
};


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



app.get("/api/productos", (req, res) => {
  db.query("SELECT * FROM productos", (err, r) => {
    if (err) return res.status(500).json(err);
    res.json(r);
  });
});


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


app.delete("/api/productos/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM productos WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ ok: true });
  });
});


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


app.get("/api/pedidos", (req, res) => {
  db.query("SELECT * FROM pedidos ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.put("/api/pedidos/entregado/:id", (req, res) => {
  db.query(
    "UPDATE pedidos SET entregado = 1 WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ ok: true });
    }
  );
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



app.listen(process.env.PORT || 3001, () => console.log("Server listo 🚀"));