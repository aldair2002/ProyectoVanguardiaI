const express = require("express");
const router = express.Router();

const {
  crearVenta,
  obtenerVentas,
  obtenerReporteVentas,
} = require("../controllers/ventasController");


router.get("/reporte", obtenerReporteVentas);


router.post("/", crearVenta);


router.get("/", obtenerVentas);

module.exports = router;