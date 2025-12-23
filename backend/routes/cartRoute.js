import express from 'express';
import { Cart } from '../models/cartModel.js';
import { Account } from '../models/accountModel.js';
import { Product } from '../models/productModel.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const calculateTotalPrice = (cartItems) => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

router.post('/', verifyToken, async (request, response) => {
    
    try {
        const { accountId, productId, quantity, size } = request.body;
        if (!accountId || !productId || !quantity || !size) {
            console.log("ERROR: Thiếu dữ liệu đầu vào");
            return response.status(400).send({
                message: 'Send all required fields: accountId, productId, quantity, size'
            });
        }

        const user = await Account.findById(accountId);
        if (!user) {
            console.log("ERROR: Không tìm thấy User có ID:", accountId); 
            return response.status(404).send({ message: "User not found! (Tài khoản không tồn tại trong DB)" });
        }
        if (user.trangThai === 'Offline') {
            return response.status(403).send({ message: "Tài khoản đang bị khóa!" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            console.log("ERROR: Không tìm thấy Product có ID:", productId);
            return response.status(404).send({ message: "Product not found! (Sản phẩm không tồn tại)" });
        }

        let cart = await Cart.findOne({ account: accountId });

        if (!cart) {
            const newCartItems = [{ 
                product: productId, 
                quantity: quantity, 
                size: size,
                price: product.giaBan 
            }];
            
            const newCart = await Cart.create({
                account: accountId,
                items: newCartItems,
                totalPrice: calculateTotalPrice(newCartItems)
            });
            return response.status(201).json({ message: "Cart created successfully", cart: newCart });
        }

        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId && p.size === size);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
            cart.items[itemIndex].price = product.giaBan; 
        } else {
            cart.items.push({ product: productId, quantity: quantity, size: size, price: product.giaBan });
        }
        cart.totalPrice = calculateTotalPrice(cart.items);
        
        await cart.save();
        return response.status(200).json({ message: "Item added to cart", cart });

    } catch (error) {
        console.log("LỖI SERVER:", error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', verifyAdmin, async (request, response) => {
    try {
        const carts = await Cart.find({})
            .populate('account', 'username email') 
            .populate({
                path: 'items.product', 
                select: 'tenSanPham imageUrl' 
            });

        return response.status(200).json({
            count: carts.length,
            data: carts,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/:accountId', verifyToken, async (request, response) => {
    try {
        const { accountId } = request.params;
        if (request.user.role !== 'admin' && request.user.id !== accountId) {
            return response.status(403).json({ message: "Bạn không có quyền xem giỏ hàng này!" });
        }

        const cart = await Cart.findOne({ account: accountId })
            .populate('account', 'username email') 
            .populate({
                path: 'items.product',
                select: 'tenSanPham imageUrl giaBan'
            });

        if (!cart) {
             return response.status(200).json({ items: [], totalPrice: 0 });
        }
        return response.status(200).json(cart);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.delete('/item/:accountId/:itemId', verifyToken, async (request, response) => {
    try {
        const { accountId, itemId } = request.params;
        if (request.user.id !== accountId) {
            return response.status(403).json({ message: "Bạn không có quyền thao tác trên giỏ hàng này!" });
        }

        const cart = await Cart.findOne({ account: accountId });
        if (!cart) {
            return response.status(404).send({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        cart.totalPrice = calculateTotalPrice(cart.items);

        await cart.save();
        return response.status(200).send({ message: "Item removed from cart", cart });

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.delete('/:accountId', verifyAdmin, async (request, response) => {
    try {
        const { accountId } = request.params;
        const result = await Cart.findOneAndDelete({ account: accountId });

        if (!result) {
            return response.status(404).send({ message: "Cart not found to delete" });
        }
        return response.status(200).send({ message: "Cart deleted successfully!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;