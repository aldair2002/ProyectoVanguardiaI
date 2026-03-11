const mongoose = require("mongoose");

const ventaSchema = new mongoose.Schema({

  numeroFactura: {
    type: String,
    required: true
  },

  fecha: {
    type: Date,
    default: Date.now
  },

  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario"
  },

  clienteNombre: {
    type: String,
    required: true
  },

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

  subtotal: Number,

  total: {
    type: Number,
    required: true
  },

  metodoPago: {
    type: String,
    enum: ["CONTADO", "CREDITO"],
    required: true
  },

  estado: {
    type: String,
    enum: ["PAGADA", "PENDIENTE"],
    default: "PAGADA"
  },

  fechaVencimiento: Date,

  pdfUrl: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Venta", ventaSchema);