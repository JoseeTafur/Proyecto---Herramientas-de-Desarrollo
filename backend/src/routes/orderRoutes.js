import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
// 1. Importa la nueva función
import { checkout, getOrderDetails, getUserOrders, getAllOrders } from '../controllers/orderController.js'

const router = express.Router();

// Rutas de cliente
router.post('/checkout', verifyToken, checkout);
router.get('/mis-pedidos', verifyToken, getUserOrders);
router.get('/detalle/:id_pedido', verifyToken, getOrderDetails);

// 2. NUEVA RUTA: Historial Global para el Admin
// Nota: Aquí lo ideal sería un middleware 'isAdmin', pero por ahora usemos verifyToken
router.get('/todas', verifyToken, getAllOrders);

export default router;