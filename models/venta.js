const mongoose = require("mongoose");

const ventaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },
  clienteNombre: String,
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto"
      },
      nombre: String,
      precio: Number,
      cantidad: Number,
      subtotal: Number
    }
  ],
  total: Number,
  metodoPago: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Venta", ventaSchema);