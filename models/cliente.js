const ClienteSchema = new mongoose.Schema({
    nombre: String,
    telefono: String,
    direccion: String,
    limiteCredito: Number,
    saldoPendiente: {
        type: Number,
        default: 0
    }
});