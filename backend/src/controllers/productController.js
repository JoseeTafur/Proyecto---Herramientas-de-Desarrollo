import productService from '../services/productService.js';
import db from '../config/db.js';

// Obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT p.*, c.nombre_categoria 
             FROM productos p 
             LEFT JOIN categorias c ON p.id_categoria = c.id_categoria 
             WHERE p.id_producto = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Crear producto (Ajustado para manejar la imagen de Multer)
export const createProduct = async (req, res) => {
    try {
        const { nombre_producto, precio, stock, id_categoria } = req.body;
        
        // Si hay un archivo subido por Multer, generamos la URL
        let imagen_url = null;
        if (req.file) {
            imagen_url = `/uploads/perfiles/${req.file.filename}`;
        }

        const query = `
            INSERT INTO productos (nombre_producto, precio, stock, id_categoria, imagen_url) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nombre_producto, precio, stock, id_categoria, imagen_url]);
        
        res.status(201).json({ message: "Producto creado con éxito", id: result.insertId });
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(400).json({ message: error.message });
    }
};

// Actualizar producto (Ya lo tenías, mantenemos la lógica de la imagen)
export const updateProduct = async (req, res) => {
    try {
        const { nombre_producto, precio, stock, id_categoria } = req.body;
        const { id } = req.params;
        
        let query = "UPDATE productos SET nombre_producto=?, precio=?, stock=?, id_categoria=? WHERE id_producto=?";
        let params = [nombre_producto, precio, stock, id_categoria, id];

        if (req.file) {
            query = "UPDATE productos SET nombre_producto=?, precio=?, stock=?, id_categoria=?, imagen_url=? WHERE id_producto=?";
            const imagen_url = `/uploads/perfiles/${req.file.filename}`;
            params = [nombre_producto, precio, stock, id_categoria, imagen_url, id];
        }

        await db.query(query, params);
        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ error: "Error al actualizar en la base de datos" });
    }
};

// LA FUNCIÓN QUE FALTABA: Eliminar producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primero verificamos si el producto existe (opcional pero recomendado)
        const [exists] = await db.query('SELECT id_producto FROM productos WHERE id_producto = ?', [id]);
        if (exists.length === 0) {
            return res.status(404).json({ message: "El producto no existe" });
        }

        await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
        res.json({ message: "Producto eliminado del inventario" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "No se pudo eliminar el producto. Verifica si tiene ventas asociadas." });
    }
};