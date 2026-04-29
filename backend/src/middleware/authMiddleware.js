import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: "No se proporcionó un token." });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Token no válido." });
        req.userId = decoded.id;
        req.userRole = decoded.rol;
        next();
    });
};

export const isAdmin = (req, res, next) => {
    if (req.userRole !== 1) { // 1 es ADMIN según nuestro script SQL
        return res.status(403).send({ message: "Requiere rol de Administrador." });
    }
    next();
};