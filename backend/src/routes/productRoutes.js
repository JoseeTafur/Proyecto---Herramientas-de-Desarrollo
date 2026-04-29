import express from 'express';
// Importamos los controladores (Asegúrate de que 'createProduct' y 'deleteProduct' existan en el controlador)
import { 
    getProducts, 
    getProductById, 
    updateProduct, 
    createProduct,
    deleteProduct 
} from '../controllers/productController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
// 1. IMPORTAMOS EL MIDDLEWARE QUE YA TIENE LA CONFIGURACIÓN DE CARPETA
import upload from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

// --- RUTAS PÚBLICAS ---

// Obtener todos los productos
router.get('/', getProducts);

// Obtener un producto específico
router.get('/:id', getProductById);


// --- RUTAS PROTEGIDAS (Solo Admin) ---

// Crear producto: Usamos el middleware 'upload' para procesar la imagen
router.post('/', verifyToken, isAdmin, upload.single('imagen'), createProduct);

// Actualizar producto: También puede recibir una imagen nueva
router.put('/:id', verifyToken, isAdmin, upload.single('imagen'), updateProduct);

// Eliminar producto
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export default router;