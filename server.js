const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const ventasRoutes = require("./routes/ventaroutes");
const usuarioRoutes = require("./routes/usuarioroutes");
const productoRoutes = require("./routes/productoroutes");
const kardexRoutes = require("./routes/kardexroutes");

const app = express();

// Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/sistemaVentas")
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.log("Error de conexión:", err));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/usuarios", usuarioRoutes);
app.use("/productos", productoRoutes);
app.use("/ventas", ventasRoutes);
app.use("/kardex", kardexRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

// Puerto
app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});