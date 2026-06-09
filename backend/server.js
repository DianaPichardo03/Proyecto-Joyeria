require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");


const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
    waitForConnections: true, 
    connectionLimit: 10, 
    queueLimit: 0,
});

console.log("DB pool listo 🟢");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "broqueles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
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

  const valid = bcrypt.compareSync(
    password, ADMIN_USER.password);

  if (!valid) {
    return res.status(401).json({ success: false });
  }

  const token = jwt.sign({ usuario }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ success: true, token });
});

const verifyToken = (req, res, next) => {

  const header = req.headers["authorization"];

  if (!header) {
    return res.status(403).json({
      error: "No token",
    });
  }

  try {

    const token = header.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_SECRET);

    next();

  } catch (err) {
     return res.status(403).json({
      error: "Token inválido",
    });

  }
};

app.use((req, res, next) => { 
  console.log("REQUEST:", req.method, req.url); 
  next(); 
});

app.get("/api/productos", (req, res) => {
  db.query("SELECT * FROM productos", (err, r) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(r);
  });
});


app.post(
  "/api/productos", verifyToken,
  (req, res, next) => {
    console.log("ANTES DE MULTER");
    next();
  },
  upload.single("imagen"),
  (req, res) => {
    
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

    const { nombre, precio, stock } = req.body;
    let imagen = "";
    if (req.file) { 
       imagen =  req.file.path;
    }

    db.query(
      "INSERT INTO productos (nombre,precio,stock,imagen) VALUES (?,?,?,?)",
      [nombre, precio, stock, imagen],
      (err) => {
        if (err){
          console.log("MYSQL ERROR:", err);
           return res.status(500).json(err);
        }
        res.json({ ok: true });
      }
    );
  }
);



app.put("/api/productos/:id", verifyToken, 
  (req, res) => {
  const { nombre, precio, stock } = req.body;

  db.query(
    "UPDATE productos SET nombre=?, precio=?, stock=? WHERE id=?",
    [nombre, precio, stock, req.params.id],
    (err) => {
      if (err) {
         return res.status(500).json(err);
      }
      res.json({ ok: true });
    }
  );
});


app.put(
  "/api/productos/imagen/:id", verifyToken,
  upload.single("imagen"),
  (req, res) => {

    if (!req.file) { 
    return res.status(400).json({ 
      error: "No se subió imagen", 
    }); 
  } 
     
    const imagen = req.file.path;
  
    db.query(
      "UPDATE productos SET imagen=? WHERE id=?",
      [imagen, req.params.id],
      (err) => {

        if (err) {
          console.log("MYSQL ERROR:", err);
          return res.status(500).json(err);
        }
        res.json({ ok: true });
      }
    );
  }
);


app.delete("/api/productos/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM productos WHERE id=?", 
    [req.params.id], (err) => {

    if (err) {
      return res.status(500).json(err);
    }
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
        if (err){
           console.log(err);
        }
      }
    );

    db.query(
      "UPDATE productos SET stock = stock - ? WHERE id=?",
      [item.cantidad, item.id],
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
  });

  res.json({ ok: true });
});


app.get("/api/pedidos", verifyToken, (req, res) => {
  db.query("SELECT * FROM pedidos ORDER BY id DESC", (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

app.put("/api/pedidos/entregado/:id", verifyToken, (req, res) => {
  db.query(
    "UPDATE pedidos SET entregado = 1 WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json({ ok: true });
    }
  );
});

app.delete("/api/pedidos/:id", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM pedidos WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json({ ok: true });
    }
  );
});


app.use((err, req, res, next) => {
  console.log("ERROR GLOBAL:"); 
  console.log(err);
   res.status(500).json({ 
    error: err.message, 
  }); 
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server listo 🚀");
});
