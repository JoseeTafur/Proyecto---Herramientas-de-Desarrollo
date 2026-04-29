// src/models/userModel.js
import db from '../config/db.js';

const userModel = {
    // Buscar un usuario por correo (para el Login)
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE correo = ?', [email]);
        return rows[0];
    },

    // Crear un nuevo usuario (para el Registro)
    create: async (userData) => {
        const { nombre, apellido, correo, password, id_rol } = userData;
        const query = 'INSERT INTO usuarios (nombre, apellido, correo, password, id_rol) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [nombre, apellido, correo, password, id_rol]);
        return result.insertId;
    }
};

export default userModel;
