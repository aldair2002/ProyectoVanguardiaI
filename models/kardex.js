const mongoose = require("mongoose");

const kardexSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      default: Date.now,
    },
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },
    ventaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venta",
      default: null,
    },
    productoNombre: {
      type: String,
      required: true,
    },
    codigo: {
      type: String,
      default: "",
    },
    movimiento: {
      type: String,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    stockAnterior: {
      type: Number,
      required: true,
    },
    stockNuevo: {
      type: Number,
      required: true,
    },
    motivo: {
      type: String,
      default: "",
    },
    referencia: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Kardex", kardexSchema);