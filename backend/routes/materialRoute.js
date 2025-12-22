import express from 'express';
import { Material } from '../models/materialModel.js';
import { Product } from '../models/productModel.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenMaterial||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const newMaterial = {
            tenMaterial: request.body.tenMaterial,
            trangThai: request.body.trangThai, 
        };

        const material = await Material.create(newMaterial);

        return response.status(201).send(material);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.post('/batch', async (request, response) => {
    try {
        const materialsData = request.body;
        if (!Array.isArray(materialsData) || materialsData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }
        const result = await Material.insertMany(materialsData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} chất liệu!`,
            data: result
        });

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', async (request, response) => {
    try{
        const materials = await Material.find({});
        return response.status(200).json({
            count: materials.length,
            data: materials,
        });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.get('/:id', async (request, response) => {
    try{
        const { id } = request.params;
        const material = await Material.findById(id);
        return response.status(200).json(material);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.put('/:id', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenMaterial||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const { id } = request.params;
        const material = await Material.findByIdAndUpdate(id, request.body);

        if (!material){
            return response.status(400).send({message: 'Material not found!'});
        }
        return response.status(200).send({message: "Material updated successfully!"});
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.delete('/:id', verifyAdmin, async (request, response) => {
    try{
        const { id } = request.params;
        const material = await Material.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' },
            { new: true }
        );
    
        await Product.updateMany(
            { maChatLieu: id }, 
            { trangThai: 'Offline' }
        );
        
        if (!material) {
            return response.status(400).send({ message: "Material not found!" });
        }

        return response.status(200).send({ message: "Material change to Offline successfully!" });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

export default router;