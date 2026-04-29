import db from '../config/db.js';

const orderService = {
    processPurchase: async (id_usuario) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Obtener items del carrito del usuario
            const [cartItems] = await connection.query(
                'SELECT c.*, p.precio FROM carrito c JOIN productos p ON c.id_producto = p.id_producto WHERE c.id_usuario = ?',
                [id_usuario]
            );

            if (cartItems.length === 0) throw new Error("El carrito está vacío");

            // 2. Calcular total
            const total = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

            // 3. Crear la Venta (Cabecera)
            const [orderResult] = await connection.query(
                'INSERT INTO ventas (id_usuario, total, estado) VALUES (?, ?, ?)',
                [id_usuario, total, 'PAGADO']
            );
            const id_pedido = orderResult.insertId; // ID generado para el historial

            // 4. Mover cada item al Detalle de Venta
            for (const item of cartItems) {
                await connection.query(
                    'INSERT INTO detalle_venta (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [id_pedido, item.id_producto, item.cantidad, item.precio]
                );

                // Actualizar Stock
                await connection.query(
                    'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
                    [item.cantidad, item.id_producto]
                );
            }

            // 5. Limpiar Carrito
            await connection.query('DELETE FROM carrito WHERE id_usuario = ?', [id_usuario]);

            await connection.commit();
            return { id_pedido };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

export default orderService;