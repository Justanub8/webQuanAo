import express, { response } from 'express';
import { Voucher } from '../models/voucherModel.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const vouchersData = request.body;

        if (!Array.isArray(vouchersData) || vouchersData.length === 0) {
            return response.status(400).send({ 
                message: "Dữ liệu phải là một danh sách (Array) và không được rỗng!" 
            });
        }
        const result = await Voucher.insertMany(vouchersData, { ordered: false });

        return response.status(201).json({
            message: `Đã thêm thành công ${result.length} mã giảm giá!`,
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
            !request.body.maGiamGia ||
            !request.body.loaiMa ||
            !request.body.trangThai ||
            !request.body.ngayThem ||
            !request.body.ngayHetHan ||
            !request.body.soLanSuDungMax ||
            !request.body.giaTri
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }
        if (new Date(request.body.ngayHetHan) <= new Date(request.body.ngayThem)) {
            return response.status(400).send({ message: "Ngày hết hạn phải sau ngày thêm!" });
        }
        const existingVoucher = await Voucher.findOne({ maGiamGia: request.body.maGiamGia.toUpperCase() });
        if (existingVoucher) {
            return response.status(400).send({ message: "Mã giảm giá đã tồn tại!" });
        }

        const newVoucher = {
            maGiamGia: request.body.maGiamGia.toUpperCase(), 
            loaiMa: request.body.loaiMa,
            trangThai: request.body.trangThai,
            ngayThem: request.body.ngayThem,
            ngayHetHan: request.body.ngayHetHan,
            soLanSuDungMax: request.body.soLanSuDungMax,
            giaTri: request.body.giaTri,
            giaTriToiThieu: request.body.giaTriToiThieu,
        };

        const voucher = await Voucher.create(newVoucher);
        return response.status(201).send(voucher);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', async (request, response) => {
    try {
        const vouchers = await Voucher.find({});
        return response.status(200).json({
            count: vouchers.length,
            data: vouchers,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const voucher = await Voucher.findById(id);

        if (!voucher) {
             return response.status(404).send({ message: "Voucher not found!" });
        }

        return response.status(200).json(voucher);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.put('/:id', verifyAdmin, async (request, response) => {
    try {
        if (
            !request.body.maGiamGia ||
            !request.body.loaiMa ||
            !request.body.trangThai ||
            !request.body.ngayThem ||
            !request.body.ngayHetHan ||
            !request.body.soLanSuDungMax ||
            !request.body.giaTri
        ) {
            return response.status(400).send({
                message: 'Send all required fields'
            });
        }

        const { id } = request.params;
        const voucher = await Voucher.findByIdAndUpdate(id, request.body, { new: true });

        if (!voucher) {
            return response.status(404).send({ message: "Voucher not found!" });
        }

        return response.status(200).send({ message: "Voucher updated successfully!", voucher });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.delete('/:id', verifyAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const voucher = await Voucher.findByIdAndUpdate(
            id, 
            { trangThai: 'Offline' }, 
            { new: true }
        );

        if (!voucher) {
            return response.status(404).send({ message: "Voucher not found!" });
        }

        return response.status(200).send({ message: "Voucher has been moved to Offline status!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.post('/check', async(request, response) => {
    try{
        const {code, totalAmount} = request.body;
        const voucher = await Voucher.findOne({
            maGiamGia: code,
            trangThai: 'Online',
        })
        if(!voucher){
            return response.status(400).send({message: 'Voucher không tồn tại'})
        }
        if (new Date() > new Date(voucher.ngayHetHan)) {
            return response.status(400).json({ message: "Mã giảm giá đã hết hạn!" });
        }
        if (voucher.soLanDaSuDung >= voucher.soLanSuDungMax) {
            return response.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng!" });
        }
        if (totalAmount < voucher.giaTriToiThieu) {
            const minStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.giaTriToiThieu);
            return response.status(400).json({ message: `Đơn hàng phải từ ${minStr} mới được dùng mã này!` });
        }
        let discountAmount = 0;
        if(voucher.loaiMa === '%'){
            discountAmount = (totalAmount * voucher.giaTri) /100;
        }else{
            discountAmount = voucher.giaTri;
        }
        if(discountAmount > totalAmount){
            discountAmount = totalAmount;
        }
        return response.status(200).json({
            message: "Áp dụng mã thành công!",
            data: {
                code: voucher.maGiamGia,
                discount: discountAmount
            }
        });
    }catch(error){
        console.log(error);
        return response.status(500).send({message: error.message});
    }
});
export default router;