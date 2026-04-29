// routes/cartRoutes.js (EL ÚNICO Y REAL)
import express from 'express';
import { addToCart, getCart, syncCart, removeFromCart } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Usamos el middleware para todas las rutas
router.use(verifyToken); 

// Obtener carrito: GET /api/carrito/
router.get('/', getCart);

// Añadir producto: POST /api/carrito/add  <-- AHORA SÍ COINCIDE
router.post('/add', addToCart);

// Sincronizar (opcional por ahora): POST /api/carrito/sync
router.post('/sync', syncCart);

router.delete('/:id_producto', verifyToken, removeFromCart);

export default router;