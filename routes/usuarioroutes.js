const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuariocontroller");

router.post("/", usuarioController.crearUsuario);
router.post("/login", usuarioController.loginUsuario);
router.get("/", usuarioController.obtenerUsuarios);
router.put("/:id", usuarioController.actualizarUsuario);
router.delete("/:id", usuarioController.eliminarUsuario);

module.exports = router;