// ordenController.js
import db from '../config/db.js'; 

export const checkout = (req, res) => createOrder(req, res);

export const createOrder = async (req, res) => {
    let connection; // Declarada fuera para acceder en el finally
    try {
        connection = await db.getConnection();
        const { items } = req.body; 
        const userId = req.userId;  

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "El carrito está vacío." });
        }

        await connection.beginTransaction(); 

        // 1. VALIDACIÓN DE SEGURIDAD Y CÁLCULO DE TOTAL
        // No confiamos en el precio que viene del frontend para el total final.
        let totalCalculado = 0;
        const itemsProcesados = [];

        for (const item of items) {
            const [product] = await connection.query(
                'SELECT stock, precio, nombre_producto FROM productos WHERE id_producto = ?', 
                [item.id_producto]
            );

            if (!product[0] || product[0].stock < item.cantidad) {
                throw new Error(`Stock insuficiente para: ${product[0]?.nombre_producto || 'ID ' + item.id_producto}`);
            }

            const precioReal = parseFloat(product[0].precio);
            totalCalculado += precioReal * item.cantidad;
            
            // Guardamos los datos validados para usarlos en el insert de detalles
            itemsProcesados.push({
                ...item,
                precio_unitario: precioReal
            });
        }

        // 2. INSERTAR EN VENTAS
        // Usamos fecha_pedido y el total calculado por el servidor
        const [orderResult] = await connection.query(
            'INSERT INTO ventas (id_usuario, total, fecha_pedido, estado) VALUES (?, ?, NOW(), "PENDIENTE")', 
            [userId, totalCalculado]
        );

        const orderId = orderResult.insertId;

        // 3. DETALLE Y ACTUALIZACIÓN DE STOCK
        for (const item of itemsProcesados) {
            // Actualizamos stock
            await connection.query(
                'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );

            // Insertamos en detalle_venta usando id_pedido
            await connection.query(
                'INSERT INTO detalle_venta (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [orderId, item.id_producto, item.cantidad, item.precio_unitario]
            );
        }

        // 4. LIMPIEZA DEL CARRITO (Importante para la persistencia)
        // Una vez hecha la compra, vaciamos el carrito del usuario en la base de datos
        await connection.query('DELETE FROM carrito WHERE id_usuario = ?', [userId]);

        await connection.commit(); 
        res.json({ message: "¡Compra realizada con éxito!", orderId });

    } catch (error) {
        if (connection) await connection.rollback(); 
        console.error("Error en la transacción de nuestro proyecto:", error.message);
        res.status(400).json({ message: error.message });
    } finally {
        if (connection) connection.release(); 
    }
};

// Historial: Usamos 'id_usuario' y 'id_pedido' para ordenar
export const getUserOrders = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM ventas WHERE id_usuario = ? ORDER BY id_pedido DESC',
            [req.userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener historial" });
    }
};

// Detalle: Unimos con la tabla 'productos'
export const getOrderDetails = async (req, res) => {
    try {
        const { id_pedido } = req.params; 
        const [rows] = await db.query(`
            SELECT dv.*, p.nombre_producto, p.imagen_url 
            FROM detalle_venta dv
            JOIN productos p ON dv.id_producto = p.id_producto
            WHERE dv.id_pedido = ?`, 
            [id_pedido]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el detalle" });
    }
};

// Obtener TODAS las ventas (Admin)
export const getAllOrders = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.*, u.nombre, u.apellido 
            FROM ventas v
            JOIN usuarios u ON v.id_usuario = u.id_usuario
            ORDER BY v.id_pedido DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener ventas generales:", error);
        res.status(500).json({ message: "Error interno al recuperar las ventas." });
    }
};