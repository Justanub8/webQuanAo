import express from 'express';
import { Brand } from '../models/brandModel.js';
import { Product } from '../models/productModel.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenBrand||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const newBrand = {
            tenBrand: request.body.tenBrand,
            trangThai: request.body.trangThai, 
        };

        const brand = await Brand.create(newBrand);

        return response.status(201).send(brand);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const brandsData = request.body;
        if (!Array.isArray(brandsData) || brandsData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }
        const result = await Brand.insertMany(brandsData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} thương hiệu!`,
            data: result
        });

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', async (request, response) => {
    try{
        const brands = await Brand.find({});
        return response.status(200).json({
            count: brands.length,
            data: brands,
        });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.get('/:id', async (request, response) => {
    try{
        const { id } = request.params;
        const brand = await Brand.findById(id);
        return response.status(200).json(brand);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.put('/:id', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenBrand||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const { id } = request.params;
        const brand = await Brand.findByIdAndUpdate(id, request.body);

        if (!brand){
            return response.status(400).send({message: 'Brand not found!'});
        }
        return response.status(200).send({message: "Brand updated successfully!"});
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.delete('/:id', verifyAdmin, async (request, response) => {
    try{
        const { id } = request.params;
        const brand = await Brand.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' },
            { new: true }
        );
        await Product.updateMany(
            { maThuongHieu: id }, 
            { trangThai: 'Offline' }
        );
        
        if (!brand) {
            return response.status(400).send({ message: "Brand not found!" });
        }

        return response.status(200).send({ message: "Brand change to Offline successfully!" });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

export default router;