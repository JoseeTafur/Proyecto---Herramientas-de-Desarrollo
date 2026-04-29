import db from '../config/db.js';

const productModel = {
    // Obtener todos los productos con el nombre de su categoría
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT p.*, c.nombre_categoria 
            FROM productos p 
            INNER JOIN categorias c ON p.id_categoria = c.id_categoria
            WHERE p.stock > 0
        `);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { nombre_producto, descripcion, precio, stock, imagen_url, id_categoria } = data;
        const [result] = await db.query(
            'INSERT INTO productos (nombre_producto, descripcion, precio, stock, imagen_url, id_categoria) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre_producto, descripcion, precio, stock, imagen_url, id_categoria]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { nombre_producto, descripcion, precio, stock, id_categoria } = data;
        return await db.query(
            'UPDATE productos SET nombre_producto=?, descripcion=?, precio=?, stock=?, id_categoria=? WHERE id_producto=?',
            [nombre_producto, descripcion, precio, stock, id_categoria, id]
        );
    },

    delete: async (id) => {
        return await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
    }
};

export default productModel;
