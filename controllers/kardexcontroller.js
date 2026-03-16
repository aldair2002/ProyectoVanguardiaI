const Kardex = require("../models/kardex");

exports.obtenerKardex = async (req, res) => {
  try {
    const filtro = {};

    if (req.query.productoId) {
      filtro.$or = [
        { productoId: req.query.productoId },
        { producto: req.query.productoId },
      ];
    }

    const movimientos = await Kardex.find(filtro)
      .sort({ fecha: -1, createdAt: -1 })
      .lean();

    const movimientosNormalizados = movimientos.map((mov) => ({
      ...mov,
      productoNombre: mov.productoNombre || "Sin producto",
      codigo: mov.codigo || "-",
      movimiento: mov.movimiento || mov.tipoMovimiento || "-",
      cantidad: mov.cantidad ?? 0,
      stockAnterior: mov.stockAnterior ?? 0,
      stockNuevo: mov.stockNuevo ?? 0,
      motivo: mov.motivo || "-",
      referencia: mov.referencia || "-",
    }));

    res.json(movimientosNormalizados);
  } catch (error) {
    console.error("Error al obtener kardex:", error);
    res.status(500).json({
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
};