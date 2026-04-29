import productModel from '../models/productModel.js';

const productService = {
    listProducts: async () => {
        return await productModel.getAll();
    },
    addProduct: async (data) => {
        if (data.precio <= 0) throw new Error("El precio debe ser mayor a cero.");
        return await productModel.create(data);
    }
};
export default productService;