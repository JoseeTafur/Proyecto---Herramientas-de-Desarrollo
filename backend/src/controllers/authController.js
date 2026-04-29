import db from '../config/db.js';
import userService from '../services/userService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
    try {
        const userId = await userService.registerUser(req.body);
        res.status(201).json({ message: "Usuario registrado con éxito", userId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const user = await userService.loginUser(correo, password);
        
        const token = jwt.sign(
            { id: user.id_usuario, rol: user.id_rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // ASIGNACIÓN DINÁMICA SEGÚN TU DB (1=ADMIN, 2=CLIENTE)
        const nombreDelRol = user.id_rol === 1 ? 'ADMIN' : 'CLIENTE';

        res.json({ 
            message: "Login exitoso", 
            token, 
            user: { 
                nombre: user.nombre, 
                rol: user.id_rol,
                tipo: nombreDelRol // Esto elimina cualquier confusión visual
            } 
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.nombre, u.apellido, u.correo, u.foto_url, u.fecha_registro, r.nombre_rol 
             FROM usuarios u 
             JOIN roles r ON u.id_rol = r.id_rol 
             WHERE u.id_usuario = ?`, 
            [req.userId]
        );
        if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { nombre, apellido, correo } = req.body;
        const userId = req.userId;
        let query = "UPDATE usuarios SET nombre = ?, apellido = ?, correo = ? WHERE id_usuario = ?";
        let params = [nombre, apellido, correo, userId];

        // Si Multer procesó una foto, cambiamos la consulta
        if (req.file) {
            const foto_url = `/uploads/perfiles/${req.file.filename}`;
            query = "UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, foto_url = ? WHERE id_usuario = ?";
            params = [nombre, apellido, correo, foto_url, userId];
        }

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Perfil actualizado correctamente" });
    } catch (error) {
        console.error("Error en updateProfile:", error);
        res.status(500).json({ error: "Error interno al actualizar perfil" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id_usuario, nombre, apellido, correo, id_rol FROM usuarios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, correo, id_rol } = req.body;

        const [result] = await db.query(
            'UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, id_rol = ? WHERE id_usuario = ?',
            [nombre, apellido, correo, id_rol, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar" });
    }
};