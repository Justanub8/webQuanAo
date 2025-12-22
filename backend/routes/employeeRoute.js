import express from 'express';
import { Employee } from '../models/employeeModel.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const employeesData = request.body;

        if (!Array.isArray(employeesData) || employeesData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }
        const result = await Employee.insertMany(employeesData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} nhân viên!`,
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
            !request.body.chucVu ||
            !request.body.luong ||
            !request.body.caLam 
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }
        const existingEmployee = await Employee.findOne({ 
            $or: [{ email: request.body.email }, { soDienThoai: request.body.soDienThoai }] 
        });

        if (existingEmployee) {
            return response.status(400).send({ message: "Email or Phone number already exists!" });
        }

        const newEmployee = {
            hoTen: request.body.hoTen,
            email: request.body.email,
            soDienThoai: request.body.soDienThoai,
            ngaySinh: request.body.ngaySinh,
            gioiTinh: request.body.gioiTinh,
            diaChi: request.body.diaChi,
            chucVu: request.body.chucVu, 
            luong: request.body.luong,
            caLam: request.body.caLam,
        };

        const employee = await Employee.create(newEmployee);
        return response.status(201).send(employee);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', verifyAdmin, async (request, response) => {
    try {
        const employees = await Employee.find({});
        return response.status(200).json({
            count: employees.length,
            data: employees,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/:id', verifyAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const employee = await Employee.findById(id);
        
        if (!employee) {
            return response.status(404).send({ message: "Employee not found!" });
        }

        return response.status(200).json(employee);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.put('/:id', verifyAdmin, async (request, response) => {
    try {
        const b = request.body;
        if (
            !b.hoTen ||
            !b.email ||
            !b.soDienThoai ||
            !b.ngaySinh ||
            !b.gioiTinh ||
            !b.diaChi ||
            !b.trangThai ||
            !b.chucVu ||
            !b.caLam ||
            b.luong === undefined ||        
            b.thuong === undefined || 
            b.thamNien === undefined || 
            b.ngayNghi === undefined
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }

        const { id } = request.params;
        const employee = await Employee.findByIdAndUpdate(id, request.body, { new: true });
        
        if (!employee) {
            return response.status(404).send({ message: "Employee not found!" });
        }

        return response.status(200).send({ message: "Employee updated successfully!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});


router.delete('/:id', verifyAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const employee = await Employee.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' }, 
            { new: true }
        );

        if (!employee) {
            return response.status(404).send({ message: "Employee not found!" });
        }

        return response.status(200).send({ message: "Employee has been moved to Offline status!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;