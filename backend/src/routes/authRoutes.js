// routes/authRoutes.js
import express from 'express';
import { 
    register, login, getProfile, updateProfile, 
    getAllUsers, updateUser, deleteUser // <--- Añade updateUser
} from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
// Usamos el middleware que ya configuramos antes para evitar duplicados
import upload from '../middleware/uploadMiddleware.js'; 
import db from '../config/db.js';

const router = express.Router();

// Rutas Públicas
router.post('/register', register);
router.post('/login', login);

// Rutas de Usuario Logueado
router.get('/perfil', verifyToken, getProfile);
router.put('/perfil', verifyToken, upload.single('foto'), updateProfile);

// --- RUTAS DE ADMINISTRACIÓN (CRUD de Usuarios) ---

// Obtener todos
router.get('/users', verifyToken, isAdmin, getAllUsers);

// ACTUALIZAR USUARIO (La que faltaba)
router.put('/users/:id', verifyToken, isAdmin, updateUser); 

// Eliminar usuario
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

export default router;