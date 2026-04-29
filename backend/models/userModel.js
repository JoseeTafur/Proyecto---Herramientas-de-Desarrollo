const db = require('../config/db');

const userModel = {
    findByEmail: async (correo) => {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE correo = ?',
            [correo]
        );
        return rows[0];
    },

    create: async (nombre, apellido, correo, passwordHash, idRol = 2) => {
        const [result] = await db.query(
            `INSERT INTO usuarios (nombre, apellido, correo, password, id_rol)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido, correo, passwordHash, idRol]
        );
        return result.insertId;
    },

    findById: async (idUsuario) => {
        const [rows] = await db.query(
            `SELECT id_usuario, nombre, apellido, correo, id_rol, fecha_registro, foto_url
             FROM usuarios WHERE id_usuario = ?`,
            [idUsuario]
        );
        return rows[0];
    }
};

module.exports = userModel;
