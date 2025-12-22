import express from 'express';
import { Account } from '../models/accountModel.js';
import { Cart } from '../models/cartModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const existingUser = await Account.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username hoặc Email đã tồn tại!" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAccount = await Account.create({
            username,
            email,
            password: hashedPassword,
            role: 'customer',
            trangThai: 'Online'
        });
        await Cart.create({
            account: newAccount._id,
            items: []
        });
        return res.status(201).json({ message: "Đăng ký thành công!", user: newAccount });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Account.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại!" });
        }
        if (user.trangThai === 'Offline') {
            return res.status(403).json({ message: "Tài khoản đã bị khóa!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không đúng!" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretkey123', 
            { expiresIn: '1d' } 
        );
        const { password: userPass, ...userInfo } = user._doc;

        return res.status(200).json({
            message: "Đăng nhập thành công!",
            token,
            user: userInfo
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;