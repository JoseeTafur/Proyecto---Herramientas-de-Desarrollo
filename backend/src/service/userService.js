import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const userService = {
    registerUser: async (userData) => {
        const existingUser = await userModel.findByEmail(userData.correo);
        if (existingUser) throw new Error('El correo ya existe');

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // CREACIÓN DEL OBJETO FINAL: Forzamos id_rol a 2 (CLIENTE)
        // Esto ignora cualquier intento de enviar un rol desde el frontend.
        const secureUserData = {
            nombre: userData.nombre,
            apellido: userData.apellido,
            correo: userData.correo,
            password: hashedPassword,
            id_rol: 2 // ID fijo de Cliente según nuestro script SQL
        };

        return await userModel.create(secureUserData);
    },

    loginUser: async (correo, password) => {
        const user = await userModel.findByEmail(correo);
        if (!user) throw new Error('Usuario no encontrado');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Contraseña incorrecta');

        return user;
    }
};

export default userService;