const express = require("express");
const router = express.Router();
const { obtenerKardex } = require("../controllers/kardexcontroller");

router.get("/", obtenerKardex);

module.exports = router;