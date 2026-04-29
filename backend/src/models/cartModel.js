import db from '../config/db.js';

const cartModel = {
    addItem: async (id_usuario, id_producto, cantidad) => {
        // Si el producto ya está en el carrito, sumamos la cantidad
        const [exists] = await db.query(
            'SELECT * FROM carrito WHERE id_usuario = ? AND id_producto = ?',
            [id_usuario, id_producto]
        );

        if (exists.length > 0) {
            return await db.query(
                'UPDATE carrito SET cantidad = cantidad + ? WHERE id_usuario = ? AND id_producto = ?',
                [cantidad, id_usuario, id_producto]
            );
        }

        return await db.query(
            'INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)',
            [id_usuario, id_producto, cantidad]
        );
    },

    getByUser: async (id_usuario) => {
        const [rows] = await db.query(`
            SELECT c.*, p.nombre_producto, p.precio, p.imagen_url 
            FROM carrito c 
            JOIN productos p ON c.id_producto = p.id_producto 
            WHERE c.id_usuario = ?`, 
            [id_usuario]
        );
        return rows;
    },

    removeItem: async (id_carrito) => {
        return await db.query('DELETE FROM carrito WHERE id_carrito = ?', [id_carrito]);
    }
};

export default cartModel;
