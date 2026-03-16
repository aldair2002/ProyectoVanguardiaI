const Producto = require("../models/productos");
const Kardex = require("../models/kardex");

exports.crearProducto = async (req, res) => {
  try {
    const { nombre, codigo, precio, stock, activo } = req.body;

    if (!nombre || !codigo || precio === undefined || stock === undefined) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    const productoExistente = await Producto.findOne({ codigo });
    if (productoExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un producto con ese código",
      });
    }

    const nuevoProducto = new Producto({
      nombre,
      codigo,
      precio: Number(precio),
      stock: Number(stock),
      activo: activo !== undefined ? activo : true,
    });

    const productoGuardado = await nuevoProducto.save();

    await Kardex.create({
      fecha: new Date(),
      productoId: productoGuardado._id,
      productoNombre: productoGuardado.nombre,
      codigo: productoGuardado.codigo,
      movimiento: "ENTRADA_INICIAL",
      cantidad: Number(stock),
      stockAnterior: 0,
      stockNuevo: Number(stock),
      motivo: "Creación inicial del producto",
      referencia: productoGuardado.codigo,
    });

    res.status(201).json({
      mensaje: "Producto guardado correctamente",
      producto: productoGuardado,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      mensaje: "Error al guardar el producto",
      error: error.message,
    });
  }
};

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      mensaje: "Error al obtener productos",
      error: error.message,
    });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const productoActual = await Producto.findById(req.params.id);

    if (!productoActual) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const stockAnterior = Number(productoActual.stock);
    const stockNuevo =
      req.body.stock !== undefined ? Number(req.body.stock) : stockAnterior;

    const datosActualizados = {
      ...req.body,
    };

    if (datosActualizados.precio !== undefined) {
      datosActualizados.precio = Number(datosActualizados.precio);
    }

    if (datosActualizados.stock !== undefined) {
      datosActualizados.stock = Number(datosActualizados.stock);
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true, runValidators: true }
    );

    if (stockNuevo !== stockAnterior) {
      await Kardex.create({
        fecha: new Date(),
        productoId: productoActualizado._id,
        productoNombre: productoActualizado.nombre,
        codigo: productoActualizado.codigo,
        movimiento: "AJUSTE",
        cantidad: Math.abs(stockNuevo - stockAnterior),
        stockAnterior,
        stockNuevo,
        motivo: req.body.motivoKardex || "Ajuste manual de stock",
        referencia: productoActualizado.codigo,
      });
    }

    res.json({
      mensaje: "Producto actualizado correctamente",
      producto: productoActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({
      mensaje: "Error al actualizar producto",
      error: error.message,
    });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    await Producto.findByIdAndDelete(req.params.id);

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      mensaje: "Error al eliminar producto",
      error: error.message,
    });
  }
};