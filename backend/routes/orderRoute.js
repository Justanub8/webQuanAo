import express from 'express';
import { Order } from '../models/orderModel.js';
import { Cart } from '../models/cartModel.js';
import { Product } from '../models/productModel.js';
import { Voucher } from '../models/voucherModel.js'
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, async (request, response) => {
    try {
        const { accountId, shippingAddress, phone, items, paymentMethod, note, voucherCode } = request.body;

        if (!accountId) return response.status(400).send({ message: "Thiếu accountId" });
        if (request.user.id !== accountId) return response.status(403).json({ message: "Không có quyền!" });
        if (!items || items.length === 0) return response.status(400).send({ message: "Giỏ hàng rỗng" });

        let productTotal = 0; // Tổng tiền hàng (chưa giảm, chưa ship)
        const orderItems = [];

        // BƯỚC 1: Duyệt qua sản phẩm để lấy giá chuẩn từ DB & check tồn kho
        for (const clientItem of items) {
            const productInDb = await Product.findById(clientItem.productId);
            if (!productInDb) {
                return response.status(404).json({ message: `Không tìm thấy sản phẩm ID: ${clientItem.productId}` });
            }
            if (productInDb.soLuongConLai < clientItem.quantity) {
                return response.status(400).json({ message: `Sản phẩm "${productInDb.tenSanPham}" không đủ hàng!` });
            }

            // Lưu item với giá lấy từ DB (bảo mật)
            orderItems.push({
                product: productInDb._id,
                quantity: clientItem.quantity,
                size: clientItem.size,
                price: productInDb.giaBan 
            });

            productTotal += clientItem.quantity * productInDb.giaBan;
        }

        // BƯỚC 2: Xử lý Voucher (Validate lại tại Server)
        let discountAmount = 0;
        let appliedVoucherId = null;

        if (voucherCode) {
            const voucher = await Voucher.findOne({ maGiamGia: voucherCode, trangThai: 'Online' });
            
            if (voucher) {
                const now = new Date();
                // Check lại điều kiện: Hạn, Lượt dùng, Giá tối thiểu
                if (now <= new Date(voucher.ngayHetHan) && 
                    voucher.soLanDaSuDung < voucher.soLanSuDungMax &&
                    productTotal >= voucher.giaTriToiThieu) { // <-- Check Min Value
                    
                    if (voucher.loaiMa === '%') {
                        discountAmount = (productTotal * voucher.giaTri) / 100;
                    } else {
                        discountAmount = voucher.giaTri;
                    }
                    if (discountAmount > productTotal) discountAmount = productTotal;

                    appliedVoucherId = voucher._id;

                    // Cập nhật lượt dùng
                    await Voucher.findByIdAndUpdate(voucher._id, { $inc: { soLanDaSuDung: 1 } });
                }
            }
        }

        // BƯỚC 3: Tính tổng tiền cuối cùng
        const finalTotalPrice = productTotal - discountAmount ;

        // BƯỚC 4: Tạo đơn hàng
        const newOrder = await Order.create({
            account: accountId,
            items: orderItems,
            totalPrice: finalTotalPrice,
            shippingAddress: shippingAddress,
            phone: phone,
            pttt: paymentMethod || "COD",
            note: note || "",
            status: "Pending",
            vouchers: appliedVoucherId // Lưu reference voucher
        });

        // BƯỚC 5: Trừ kho sản phẩm
        await Promise.all(orderItems.map(async (item) => {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { soLuongConLai: -item.quantity, soLuongDaBan: item.quantity }
            });
        }));

        // BƯỚC 6: Xóa sản phẩm đã mua khỏi giỏ hàng
        const currentCart = await Cart.findOne({ account: accountId });
        if (currentCart) {
            currentCart.items = currentCart.items.filter(cItem => {
                // Giữ lại những item KHÔNG nằm trong danh sách vừa mua
                return !orderItems.some(oItem => 
                    oItem.product.toString() === cItem.product.toString() && 
                    oItem.size === cItem.size
                );
            });
            // Tính lại tổng tiền giỏ hàng sau khi xoá
            // (Đoạn này tuỳ logic giỏ hàng của bạn, có thể set 0 hoặc tính lại)
             await currentCart.save();
        }

        return response.status(201).json({ message: "Đặt hàng thành công!", order: newOrder });

    } catch (error) {
        console.error("Order Error:", error);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', verifyAdmin, async (request, response) => {
    try {
        const orders = await Order.find({})
            .populate('account', 'username email') 
            .populate({
                path: 'items.product',
                select: 'tenSanPham imageUrl' 
            })
            .populate('vouchers')
            .sort({ createdAt: -1 }); 
            
        return response.status(200).json({
            count: orders.length,
            data: orders
        });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

router.get('/user/:accountId', verifyToken, async (request, response) => {
    try {
        const { accountId } = request.params;
        if (request.user.role !== 'admin' && request.user.id !== accountId) {
             return response.status(403).json({ message: "Không có quyền xem đơn hàng này!" });
        }

        const orders = await Order.find({ account: accountId })
            .populate({
                path: 'items.product',
                select: 'tenSanPham imageUrl' 
            })
            .sort({ createdAt: -1 });
        return response.status(200).json(orders);
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

router.get('/:id', verifyToken, async (request, response) => {
    try {
        const { id } = request.params;
        const order = await Order.findById(id)
            .populate('account', 'username email phone')
            .populate('items.product'); 

        if (!order) {
            return response.status(404).json({ message: "Order not found" });
        }

        if (request.user.role !== 'admin' && request.user.id !== order.account._id.toString()) {
            return response.status(403).json({ message: "Không có quyền xem chi tiết đơn hàng này!" });
        }

        return response.status(200).json(order);
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

router.put('/:id', verifyToken, async (request, response) => {
    try {
        const { id } = request.params;
        const { status } = request.body; 
        
        const order = await Order.findById(id);
        if (!order) {
            return response.status(404).send({ message: "Order not found!" });
        }

        if (request.user.role !== 'admin') {
            if (order.account.toString() !== request.user.id) {
                return response.status(403).json({ message: "Không phải đơn hàng của bạn!" });
            }
            if (status !== 'Cancelled') {
                return response.status(403).json({ message: "Bạn chỉ có quyền Hủy đơn hàng!" });
            }
            if (order.status !== 'Pending') {
                return response.status(400).json({ message: "Đơn hàng đã được xử lý, không thể hủy!" });
            }
        }
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            await Promise.all(order.items.map(async (item) => {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { 
                        soLuongConLai: +item.quantity, 
                        soLuongDaBan: -item.quantity  
                    }
                });
            }));
        }

        order.status = status;
        await order.save(); 

        return response.status(200).send({ message: "Order status updated successfully!", order });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.delete('/:id', verifyAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Order.findByIdAndDelete(id);

        if (!result) {
            return response.status(404).send({ message: "Order not found!" });
        }
        return response.status(200).send({ message: "Order deleted successfully!" });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

export default router;