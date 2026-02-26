const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  password: { type: String, required: true },
  rol: {
    type: String,
    enum: ["admin", "vendedor"],
    default: "vendedor"
  },
  activo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Usuario", usuarioSchema);