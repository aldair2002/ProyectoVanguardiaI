const Usuario = require("../models/usuarios");
const bcrypt = require ("bcryptjs");
const jwt = require("jsonwebtoken");



exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, password, rol, activo } = req.body;

    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      password: passwordEncriptada,
      rol,
      activo
    });

    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: {
        _id: usuarioGuardado._id,
        nombre: usuarioGuardado.nombre,
        correo: usuarioGuardado.correo,
        rol: usuarioGuardado.rol,
        activo: usuarioGuardado.activo,
        createdAt: usuarioGuardado.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.loginusuario = async (req , res) => {
  try{
    const {correo , password } = req.body;
    const usuario = await usuario.findOne({correo});
    if (!usuario){
  return res.status(400).json({mensaje: "usuario no encontrado"});
    }
    if (!usuario.activo){
      return res.status(400).json({mensaje: "usuario no activo"});
    }
    const passwordvalido = await bcrypt.compare(password, usuario.password);
    if(!passwordvalido){
      return res.status(400).json({mensaje: "contraseña incorrecta "}); 
    }

    const token  = jwt.sign (
      {
        id: usuario._id,
        rol: usuario.rol,
        correo: usuario.correo,
      },
            "clave_secreta",
      { expiresIn: "8h" }
    );

    res.status(200).json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  };


exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password")
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.actualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.eliminarUsuario = async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};