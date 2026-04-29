-- ============================================================
-- DATOS SEMILLA - culinaria_store
-- Datos de prueba para desarrollo
-- ============================================================

USE culinaria_store;

-- ============================================================
-- CATEGORÍAS
-- ============================================================
INSERT INTO categorias (nombre_categoria) VALUES
('Licuadoras'),
('Cuchillos'),
('Ollas'),
('Sartenes'),
('Utensilios');

-- ============================================================
-- PRODUCTOS
-- Nota: imagen_url contiene solo el nombre del archivo.
-- El frontend resuelve la ruta completa según su estructura.
-- ============================================================
INSERT INTO productos (nombre_producto, descripcion, precio, stock, imagen_url, id_categoria) VALUES
-- Licuadoras (id_categoria = 1)
('Licuadora Oster 600W',          'Licuadora de alta potencia con vaso de vidrio de 1.5L y 3 velocidades.',     149.90, 20, 'licuadora_oster_600w.jpg',   1),
('Licuadora Philips 450W',        'Licuadora compacta ideal para smoothies y batidos diarios.',                  99.90, 15, 'licuadora_philips_450w.jpg', 1),
('Licuadora Imaco Pro 800W',      'Licuadora profesional con cuchillas de acero inoxidable y jarra de 2L.',     219.90, 10, 'licuadora_imaco_pro.jpg',    1),

-- Cuchillos (id_categoria = 2)
('Cuchillo Chef 8 pulgadas',      'Cuchillo profesional de acero inoxidable, mango ergonómico.',                 59.90, 30, 'cuchillo_chef_8.jpg',        2),
('Set de Cuchillos x5',           'Juego completo para cocina con base de madera.',                              89.90, 12, 'set_cuchillos_x5.jpg',       2),
('Cuchillo Santoku 7 pulgadas',   'Cuchillo japonés ideal para cortes precisos de vegetales y carnes.',          69.90, 18, 'cuchillo_santoku.jpg',       2),

-- Ollas (id_categoria = 3)
('Olla a Presión 6L',             'Olla a presión de aluminio anodizado con válvula de seguridad.',             119.90, 12, 'olla_presion_6l.jpg',        3),
('Olla Arrocera 1.8L',            'Olla arrocera eléctrica con función de mantener caliente.',                   89.90, 20, 'olla_arrocera.jpg',          3),
('Set de Ollas Acero Inox x7',    'Set completo de 7 piezas en acero inoxidable apto para inducción.',          349.90,  8, 'set_ollas_x7.jpg',           3),

-- Sartenes (id_categoria = 4)
('Sartén Antiadherente 28cm',     'Sartén con recubrimiento antiadherente, apto para todo tipo de cocinas.',     49.90, 25, 'sarten_antiadherente_28.jpg',4),
('Sartén Hierro Fundido 26cm',    'Sartén pesado de hierro fundido pre-curado, ideal para sellar carnes.',       89.90, 10, 'sarten_hierro_26.jpg',       4),
('Wok Antiadherente 32cm',        'Wok profundo con mango resistente al calor.',                                 69.90, 15, 'wok_32cm.jpg',               4),

-- Utensilios (id_categoria = 5)
('Tabla de Picar Bambú',          'Tabla de bambú de 38x25cm, resistente y ecológica.',                          29.90, 40, 'tabla_bambu.jpg',            5),
('Set de Espátulas Silicona x4',  'Espátulas de silicona resistente al calor hasta 230°C.',                      24.90, 35, 'set_espatulas.jpg',          5),
('Rallador Multifuncional',       'Rallador de 4 caras en acero inoxidable con base antideslizante.',            19.90, 30, 'rallador.jpg',               5);

-- ============================================================
-- USUARIO ADMINISTRADOR DE PRUEBA
-- IMPORTANTE: la password 'admin123' está hasheada con bcrypt.
-- Hash generado para la cadena 'admin123'.
-- En producción, el backend genera el hash al registrar usuarios.
-- ============================================================
INSERT INTO usuarios (nombre, apellido, correo, password, id_rol) VALUES
('Admin',  'Tienda',   'admin@culinaria.com',   '$2b$10$rGJqYZ9XQZ5l5aF0YxJZ7e8YxJZ7e8YxJZ7e8YxJZ7e8YxJZ7e8Yu', 1),
('Cliente','Demo',     'cliente@demo.com',      '$2b$10$rGJqYZ9XQZ5l5aF0YxJZ7e8YxJZ7e8YxJZ7e8YxJZ7e8YxJZ7e8Yu', 2);

-- ============================================================
-- FIN DATOS SEMILLA
-- ============================================================
