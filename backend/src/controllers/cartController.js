// cartController.js
import db from '../config/db.js';

export const addToCart = async (req, res) => {
    try {
        const { id_producto, cantidad } = req.body;
        const userId = req.userId; 

        await db.query(`
            INSERT INTO carrito (id_usuario, id_producto, cantidad) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)`, 
            [userId, id_producto, cantidad]
        );

        res.json({ message: "Sincronizado con la base de datos" });
    } catch (error) {
        res.status(500).json({ message: "Error al guardar en cuenta" });
    }
};

export const syncCart = async (req, res) => {
    const { items } = req.body;
    const userId = req.userId; 
    let connection; // Declarada fuera para el bloque finally

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.query('DELETE FROM carrito WHERE id_usuario = ?', [userId]);

        if (items && items.length > 0) {
            const values = items.map(item => [userId, item.id_producto, item.cantidad]);
            // Ajustado para coincidir con tus columnas: id_usuario, id_producto, cantidad
            await connection.query('INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES ?', [values]);
        }
        
        await connection.commit();
        res.json({ message: "Carrito guardado en DB" });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: "Error al sincronizar" });
    } finally {
        if (connection) connection.release(); // Verificación de seguridad
    }
};

export const getCart = async (req, res) => {
    try {
        // Obtenemos los productos que el usuario ya tenía guardados
        const [items] = await db.query(`
            SELECT c.id_producto, c.cantidad, p.nombre_producto, p.precio, p.imagen_url 
            FROM carrito c
            JOIN productos p ON c.id_producto = p.id_producto
            WHERE c.id_usuario = ?`, [req.userId]);
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Error al recuperar el carrito de la DB" });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { id_producto } = req.params;
        const userId = req.userId;

        await db.query(
            'DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?',
            [userId, id_producto]
        );

        res.json({ message: "Producto eliminado del carrito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
};