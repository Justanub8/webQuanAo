import express from 'express';
import { Category } from '../models/categoryModel.js';
import { Product } from '../models/productModel.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenCategory||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const newCategory = {
            tenCategory: request.body.tenCategory,
            trangThai: request.body.trangThai, 
        };

        const category = await Category.create(newCategory);

        return response.status(201).send(category);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const categoriesData = request.body;

        if (!Array.isArray(categoriesData) || categoriesData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }

        const result = await Category.insertMany(categoriesData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} danh mục!`,
            data: result
        });

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});
router.get('/', async (request, response) => {
    try{
        const categories = await Category.find({});
        return response.status(200).json({
            count: categories.length,
            data: categories,
        });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})
router.get('/:id', async (request, response) => {
    try{
        const { id } = request.params;
        const category = await Category.findById(id);
        return response.status(200).json(category);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.put('/:id', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenCategory||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const { id } = request.params;
        const category = await Category.findByIdAndUpdate(id, request.body);

        if (!category){
            return response.status(400).send({message: 'Category not found!'});
        }
        return response.status(200).send({message: "Category updated successfully!"});
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.delete('/:id', verifyAdmin, async (request, response) => {
    try{
        const { id } = request.params;
        const category = await Category.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' },
            { new: true } 
        );
        await Product.updateMany(
            { category: id }, 
            { trangThai: 'Offline' }
        );
        
        if (!category) {
            return response.status(400).send({ message: "Category not found!" });
        }

        return response.status(200).send({ message: "Category deleted successfully!" });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

export default router;