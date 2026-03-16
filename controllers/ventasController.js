const Venta = require("../models/venta");
const Producto = require("../models/productos");
const Kardex = require("../models/kardex");

const obtenerRangoFechas = (periodo, desde, hasta) => {
  let fechaInicio = null;
  let fechaFin = new Date();

  fechaFin.setHours(23, 59, 59, 999);

  switch (periodo) {
    case "hoy":
      fechaInicio = new Date();
      fechaInicio.setHours(0, 0, 0, 0);
      break;

    case "semana":
      fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 6);
      fechaInicio.setHours(0, 0, 0, 0);
      break;

    case "mes":
      fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      fechaInicio.setHours(0, 0, 0, 0);
      break;

    case "6meses":
      fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 6);
      fechaInicio.setHours(0, 0, 0, 0);
      break;

    case "personalizado":
      if (!desde || !hasta) return null;

      fechaInicio = new Date(desde);
      fechaFin = new Date(hasta);

      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);
      break;

    default:
      fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      fechaInicio.setHours(0, 0, 0, 0);
      break;
  }

  return { fechaInicio, fechaFin };
};

const obtenerFechaVenta = (venta) => {
  return venta.createdAt || venta.fecha || venta.fechaVenta || null;
};

exports.crearVenta = async (req, res) => {
  try {
    const {
      numeroFactura,
      clienteNombre,
      items,
      total,
      metodoPago,
      estado,
      fechaVencimiento,
    } = req.body;

    if (!numeroFactura) {
      return res.status(400).json({
        mensaje: "El número de factura es obligatorio",
      });
    }

    if (!clienteNombre) {
      return res.status(400).json({
        mensaje: "El nombre del cliente es obligatorio",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        mensaje: "Los items de la venta son obligatorios",
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        mensaje: "El total de la venta no es válido",
      });
    }

    if (!metodoPago) {
      return res.status(400).json({
        mensaje: "El método de pago es obligatorio",
      });
    }

    for (const item of items) {
      const productoId =
        item.producto?._id ||
        item.producto ||
        item.productoId ||
        item.productId ||
        item._id;

      const producto = await Producto.findById(productoId);

      if (!producto) {
        return res.status(404).json({
          mensaje: "Producto no encontrado",
        });
      }

      if (Number(item.cantidad) > Number(producto.stock)) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para ${producto.nombre}`,
        });
      }
    }

    const nuevaVenta = new Venta({
      numeroFactura,
      clienteNombre,
      items,
      total,
      metodoPago,
      estado: estado || "PAGADA",
      fechaVencimiento: fechaVencimiento || null,
    });

    const ventaGuardada = await nuevaVenta.save();

    for (const item of items) {
      const productoId =
        item.producto?._id ||
        item.producto ||
        item.productoId ||
        item.productId ||
        item._id;

      const producto = await Producto.findById(productoId);

      if (!producto) {
        return res.status(404).json({
          mensaje: "Producto no encontrado",
        });
      }

      const cantidadVendida = Number(item.cantidad);
      const stockAnterior = Number(producto.stock);
      const stockNuevo = stockAnterior - cantidadVendida;

      producto.stock = stockNuevo;
      await producto.save();

      await Kardex.create({
        fecha: new Date(),
        productoId: producto._id,
        ventaId: ventaGuardada._id,
        productoNombre: producto.nombre,
        codigo: producto.codigo,
        movimiento: "SALIDA_VENTA",
        cantidad: cantidadVendida,
        stockAnterior,
        stockNuevo,
        motivo: `Venta factura ${numeroFactura}`,
        referencia: numeroFactura,
      });
    }

    res.status(201).json({
      mensaje: "Venta registrada correctamente",
      venta: ventaGuardada,
    });
  } catch (error) {
    console.error("Error al crear venta:", error);
    res.status(500).json({
      mensaje: "Error al registrar la venta",
      error: error.message,
    });
  }
};

exports.obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().lean();

    ventas.sort((a, b) => {
      const fechaA = new Date(obtenerFechaVenta(a) || 0).getTime();
      const fechaB = new Date(obtenerFechaVenta(b) || 0).getTime();
      return fechaB - fechaA;
    });

    res.json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({
      mensaje: "Error al obtener ventas",
      error: error.message,
    });
  }
};

exports.obtenerReporteVentas = async (req, res) => {
  try {
    const { periodo = "mes", desde, hasta } = req.query;

    const rango = obtenerRangoFechas(periodo, desde, hasta);

    if (periodo === "personalizado" && !rango) {
      return res.status(400).json({
        mensaje: "Debes enviar las fechas desde y hasta",
      });
    }

    const ventasDb = await Venta.find().lean();

    const ventasFiltradas = ventasDb.filter((venta) => {
      const fechaVentaRaw = obtenerFechaVenta(venta);
      if (!fechaVentaRaw) return false;

      const fechaVenta = new Date(fechaVentaRaw);
      return (
        fechaVenta >= rango.fechaInicio &&
        fechaVenta <= rango.fechaFin
      );
    });

    ventasFiltradas.sort((a, b) => {
      const fechaA = new Date(obtenerFechaVenta(a) || 0).getTime();
      const fechaB = new Date(obtenerFechaVenta(b) || 0).getTime();
      return fechaB - fechaA;
    });

    const totalFacturas = ventasFiltradas.length;

    const totalVendido = ventasFiltradas.reduce(
      (acc, venta) => acc + Number(venta.total || 0),
      0
    );

    const totalProductosVendidos = ventasFiltradas.reduce((acc, venta) => {
      return (
        acc +
        (venta.items || []).reduce(
          (subAcc, item) => subAcc + Number(item.cantidad || 0),
          0
        )
      );
    }, 0);

    const productosMap = {};

    for (const venta of ventasFiltradas) {
      for (const item of venta.items || []) {
        const key =
          item.producto ||
          item.productoId ||
          item.productId ||
          item.codigo ||
          item.nombre;

        if (!productosMap[key]) {
          productosMap[key] = {
            nombre: item.nombre || "Producto",
            codigo: item.codigo || "-",
            cantidadVendida: 0,
            totalVendido: 0,
          };
        }

        const cantidad = Number(item.cantidad || 0);
        const subtotal =
          Number(item.subtotal || 0) ||
          Number(item.precio || 0) * cantidad;

        productosMap[key].cantidadVendida += cantidad;
        productosMap[key].totalVendido += subtotal;
      }
    }

    const productosResumen = Object.values(productosMap).sort(
      (a, b) => b.cantidadVendida - a.cantidadVendida
    );

    res.json({
      ventas: ventasFiltradas,
      resumen: {
        periodo,
        desde: desde || null,
        hasta: hasta || null,
        totalFacturas,
        totalVendido,
        totalProductosVendidos,
      },
      productosResumen,
    });
  } catch (error) {
    console.error("Error al obtener reporte de ventas:", error);
    res.status(500).json({
      mensaje: "Error al obtener reporte de ventas",
      error: error.message,
    });
  }
};