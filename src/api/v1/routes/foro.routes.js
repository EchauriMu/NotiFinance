// routes/ForoRoutes.js
import express from "express";
import ForoController from "../controllers/Foro.controller.js";

const router = express.Router();

router.post("/post", ForoController.createForo);
router.get("/get/:symbol", ForoController.getForoBySymbol);
router.put("/put/:symbol", ForoController.updateForo);
router.delete("/del/:symbol", ForoController.deleteForo);
router.post("/post/:symbol/comentario", ForoController.addComentario);
// Ruta para inicializar un foro con valores predeterminados
router.post('/inicializar/:symbol', ForoController.inicializarForo);
export default router;