import express from 'express';
import { Customer } from '../models/customerModel.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const customersData = request.body;

        if (!Array.isArray(customersData) || customersData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }
        const result = await Customer.insertMany(customersData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} khách hàng!`,
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
            !request.body.hoTen ||
            !request.body.email ||
            !request.body.soDienThoai ||
            !request.body.ngaySinh ||
            !request.body.gioiTinh ||
            !request.body.diaChi ||
            !request.body.trangThai
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }
        const existingCustomer = await Customer.findOne({ 
            $or: [{ email: request.body.email }, { soDienThoai: request.body.soDienThoai }] 
        });
        
        if (existingCustomer) {
            return response.status(400).send({ message: "Email or Phone number already exists!" });
        }

        const newCustomer = {
            hoTen: request.body.hoTen,
            email: request.body.email,
            soDienThoai: request.body.soDienThoai,
            ngaySinh: request.body.ngaySinh,
            gioiTinh: request.body.gioiTinh,
            diaChi: request.body.diaChi,
            trangThai: request.body.trangThai
        };

        const customer = await Customer.create(newCustomer);
        return response.status(201).send(customer);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', verifyAdmin, async (request, response) => {
    try {
        const customers = await Customer.find({ });
        return response.status(200).json({
            count: customers.length,
            data: customers,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/:id', verifyToken, async (request, response) => {
    try {
        const { id } = request.params;
        const customer = await Customer.findById(id);
        if (!customer) {
            return response.status(404).send({ message: "Customer not found!" });
        }

        return response.status(200).json(customer);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});
router.put('/:id', verifyToken, async (request, response) => {
    try {
        if (
            !request.body.hoTen ||
            !request.body.email ||
            !request.body.soDienThoai ||
            !request.body.ngaySinh ||
            !request.body.gioiTinh ||
            !request.body.diaChi ||
            !request.body.trangThai
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }

        const { id } = request.params;
        const customer = await Customer.findByIdAndUpdate(id, request.body, { new: true });

        if (!customer) {
            return response.status(404).send({ message: "Customer not found!" });
        }

        return response.status(200).send({ message: "Customer updated successfully!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.delete('/:id', verifyAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const customer = await Customer.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' }, 
            { new: true }
        );

        if (!customer) {
            return response.status(404).send({ message: "Customer not found!" });
        }

        return response.status(200).send({ message: "Customer has been moved to Offline status!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;