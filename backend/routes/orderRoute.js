import express from 'express';
import { Order } from '../models/orderModel.js';
import { Cart } from '../models/cartModel.js';
import { Product } from '../models/productModel.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, async (request, response) => {
    try {
        const { accountId, shippingAddress, phone, items, paymentMethod, note } = request.body;

        if (!accountId) {
            return response.status(400).send({ message: "AccountId is required" });
        }
        if (request.user.id !== accountId) {
            return response.status(403).json({ message: "Bạn không được phép đặt hàng cho tài khoản khác!" });
        }

        if (!items || items.length === 0) {
            return response.status(400).send({ message: "Order items cannot be empty" });
        }

        let finalTotalPrice = 0;
        const orderItems = [];
        for (const clientItem of items) {
            const productInDb = await Product.findById(clientItem.productId);
            if (!productInDb) {
                return response.status(404).json({ message: `Product ID ${clientItem.productId} not found` });
            }
            if (productInDb.soLuongConLai < clientItem.quantity) {
                return response.status(400).json({ 
                    message: `Sản phẩm "${productInDb.tenSanPham}" đã hết hàng hoặc không đủ số lượng!` 
                });
            }

            const itemSize = clientItem.size;
            if (!itemSize) {
                return response.status(400).json({ 
                    message: `Vui lòng chọn size cho sản phẩm: ${productInDb.tenSanPham}` 
                });
            }

            orderItems.push({
                product: productInDb._id,
                quantity: clientItem.quantity,
                size: itemSize,
                price: productInDb.giaBan 
            });

            finalTotalPrice += clientItem.quantity * productInDb.giaBan;
        }

        const newOrder = await Order.create({
            account: accountId,
            items: orderItems,
            totalPrice: finalTotalPrice , 
            shippingAddress: shippingAddress || "Default Address",
            phone: phone || "",
            paymentMethod: paymentMethod || "COD",
            note: note || "",
            status: "Pending"
        });

        await Promise.all(orderItems.map(async (orderItem) => {
            await Product.findByIdAndUpdate(orderItem.product, {
                $inc: { 
                    soLuongConLai: -orderItem.quantity,
                    soLuongDaBan: orderItem.quantity
                }
            });
        }));

        const currentCart = await Cart.findOne({ account: accountId });
        if (currentCart) {
            currentCart.items = currentCart.items.filter(cartItem => {
                const isBought = orderItems.some(orderItem => 
                    orderItem.product.toString() === cartItem.product.toString() && 
                    orderItem.size === cartItem.size
                );
                return !isBought; 
            });
            currentCart.totalPrice = currentCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            await currentCart.save();
        }

        return response.status(201).json({ 
            message: "Order placed successfully!", 
            order: newOrder 
        });

    } catch (error) {
        console.error("Error creating order:", error);
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