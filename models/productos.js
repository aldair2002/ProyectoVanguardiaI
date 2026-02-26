const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  codigo: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Producto", productoSchema);