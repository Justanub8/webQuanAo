import express from 'express';
import { Tag } from '../models/tagModel.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const tagsData = request.body;

        if (!Array.isArray(tagsData) || tagsData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }

        const result = await Tag.insertMany(tagsData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} tags!`,
            data: result
        });

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.post('/', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenTag||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const newTag = {
            tenTag: request.body.tenTag,
            trangThai: request.body.trangThai, 
        };

        const tag = await Tag.create(newTag);

        return response.status(201).send(tag);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.get('/', async (request, response) => {
    try{
        const tags = await Tag.find({});
        return response.status(200).json({
            count: tags.length,
            data: tags,
        });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.get('/:id', async (request, response) => {
    try{
        const { id } = request.params;
        const tag = await Tag.findById(id);
        return response.status(200).json(tag);
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.put('/:id', verifyAdmin, async (request, response) => {
    try{
        if(
            !request.body.tenTag||
            !request.body.trangThai
        ){
            return response.status(400).send({
                message: "Send all required fields"
            });
        }

        const { id } = request.params;
        const tag = await Tag.findByIdAndUpdate(id, request.body, { new: true });

        if (!tag){
            return response.status(400).send({message: 'Tag not found!'});
        }
        return response.status(200).send({message: "Tag updated successfully!"});
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

router.delete('/:id', verifyAdmin, async (request, response) => {
    try{
        const { id } = request.params;
        const tag = await Tag.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' }, 
            { new: true } 
        );
        if (!tag) {
            return response.status(400).send({ message: "Tag not found!" });
        }
        return response.status(200).send({ message: "Tag deleted successfully!" });
    }catch(error){
        console.log(error.message);
        return response.status(500).send({message: error.message})
    }
})

export default router;