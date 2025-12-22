import express from 'express';
import { Product } from '../models/productModel.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const productsData = request.body;
        
        if (!Array.isArray(productsData) || productsData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }
        const result = await Product.insertMany(productsData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} sản phẩm!`,
            data: result
        });

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.post('/', verifyAdmin, async (request, response) => {
    try {
        if (
            !request.body.tenSanPham ||
            !request.body.moTa ||
            !request.body.trangThai ||
            !request.body.giaBan ||
            !request.body.soLuongConLai ||
            !request.body.imageUrl ||
            !request.body.kichThuoc ||
            !request.body.maMauSac ||
            !request.body.category ||
            !request.body.maChatLieu ||
            !request.body.maThuongHieu
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }

        const newProduct = {
            tenSanPham: request.body.tenSanPham,
            moTa: request.body.moTa,
            trangThai: request.body.trangThai,
            giaBan: request.body.giaBan,
            soLuongConLai: request.body.soLuongConLai,
            soLuongDaBan: request.body.soLuongDaBan || 0,
            imageUrl: request.body.imageUrl,
            kichThuoc: request.body.kichThuoc,
            maMauSac: request.body.maMauSac,
            category: request.body.category,
            maChatLieu: request.body.maChatLieu,
            maThuongHieu: request.body.maThuongHieu,
            maTag: request.body.maTag || null 
        };

        const product = await Product.create(newProduct);
        return response.status(201).send(product);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

router.get('/', async (request, response) => {
    try {
        const products = await Product.find({})
            .populate('category', 'tenCategory') 
            .populate('maThuongHieu', 'tenBrand')
            .populate('maChatLieu', 'tenChatLieu') 
            .populate('maTag'); 

        return response.status(200).json({
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});
router.get('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const product = await Product.findById(id)
            .populate('category')
            .populate('maThuongHieu')
            .populate('maChatLieu')
            .populate('maTag');
        
        if (!product) {
             return response.status(404).send({ message: "Product not found!" });
        }

        return response.status(200).json(product);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.put('/:id', verifyAdmin, async (request, response) => {
    try {
        if (
            !request.body.tenSanPham ||
            !request.body.moTa ||
            !request.body.trangThai ||
            !request.body.giaBan ||
            !request.body.soLuongConLai ||
            !request.body.imageUrl ||
            !request.body.kichThuoc ||
            !request.body.maMauSac ||
            !request.body.category ||
            !request.body.maChatLieu ||
            !request.body.maThuongHieu
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }

        const { id } = request.params;
        const product = await Product.findByIdAndUpdate(id, request.body, { new: true });

        if (!product) {
            return response.status(404).send({ message: "Product not found!" });
        }

        return response.status(200).send({ message: "Product updated successfully!", product });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.delete('/:id', verifyAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const product = await Product.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' }, 
            { new: true }
        );

        if (!product) {
            return response.status(404).send({ message: "Product not found!" });
        }

        return response.status(200).send({ message: "Product has been moved to Offline status!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;