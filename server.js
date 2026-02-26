const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const usuarioRoutes = require("./routes/usuarioroutes");
const productoRoutes = require("./routes/productoroutes");

const app = express();

// Conexión a MongoDB (localhost)
mongoose.connect("mongodb://localhost:27017/sistemaVentas")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Error de conexión:", err));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/usuarios", usuarioRoutes);
app.use("/productos", productoRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

// Puerto
app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});