// backend/src/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Usamos la carpeta que indicaste
        cb(null, 'uploads/perfiles/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
export default upload;