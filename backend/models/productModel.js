const db = require('../config/db');

const productModel = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT p.*, c.nombre_categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            ORDER BY p.fecha_creacion DESC
        `);
        return rows;
    },

    findByCategory: async (idCategoria) => {
        const [rows] = await db.query(
            'SELECT * FROM productos WHERE id_categoria = ?',
            [idCategoria]
        );
        return rows;
    },

    findById: async (idProducto) => {
        const [rows] = await db.query(
            'SELECT * FROM productos WHERE id_producto = ?',
            [idProducto]
        );
        return rows[0];
    }
};

module.exports = productModel;
