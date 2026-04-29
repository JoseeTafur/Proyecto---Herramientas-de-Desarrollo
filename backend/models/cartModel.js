const db = require('../config/db');

const cartModel = {
    findByUser: async (idUsuario) => {
        const [rows] = await db.query(`
            SELECT c.id_carrito, c.cantidad, p.id_producto, p.nombre_producto,
                   p.precio, p.imagen_url
            FROM carrito c
            INNER JOIN productos p ON c.id_producto = p.id_producto
            WHERE c.id_usuario = ?
        `, [idUsuario]);
        return rows;
    },

    add: async (idUsuario, idProducto, cantidad) => {
        const [result] = await db.query(
            'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)',
            [idUsuario, idProducto, cantidad]
        );
        return result.insertId;
    },

    remove: async (idCarrito) => {
        const [result] = await db.query(
            'DELETE FROM carrito WHERE id_carrito = ?',
            [idCarrito]
        );
        return result.affectedRows;
    }
};

module.exports = cartModel;
