import express from 'express';
import { Account, UserAccount, EmployeeAccount } from '../models/accountModel.js';
import { Cart } from '../models/cartModel.js';
import bcrypt from 'bcryptjs'; 
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', verifyAdmin, async (request, response) => {
    try {
        const { username, password, trangThai, role, email, ...otherFields } = request.body;

        if (!username || !password || !role || !email) {
            return response.status(400).send({
                message: 'Send all required fields: username, password, role, email'
            });
        }
        
        const existingUsername = await Account.findOne({ username });
        if (existingUsername) return response.status(400).send({ message: "Username already exists!" });
        const existingEmail = await Account.findOne({ email });
        if (existingEmail) return response.status(400).send({ message: "Email already exists!" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newAccount;

        if (role === 'customer') {
            newAccount = await UserAccount.create({
                username,
                password: hashedPassword, 
                email,
                trangThai: trangThai || 'Online', 
                role,
                ...otherFields
            });
            await Cart.create({ account: newAccount._id, items: [] });

        } else if (role === 'employee' || role === 'admin') {
            newAccount = await EmployeeAccount.create({
                username,
                email,
                password: hashedPassword, 
                trangThai: trangThai || 'Online',
                role,
                ...otherFields
            });
        } else {
            return response.status(400).send({ message: "Invalid role! Must be 'customer' or 'employee'" });
        }

        return response.status(201).send(newAccount);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.post('/batch', verifyAdmin, async (request, response) => {
    try {
        const accountsData = request.body;
        
        if (!Array.isArray(accountsData) || accountsData.length === 0) {
            return response.status(400).send({ message: "Data must be a non-empty array" });
        }

        const results = [];
        const errors = [];
        const salt = await bcrypt.genSalt(10); 

        for (const acc of accountsData) {
            try {
                if (!acc.username || !acc.password || !acc.email || !acc.role) {
                    throw new Error(`Missing fields for user: ${acc.username || 'Unknown'}`);
                }
                const exists = await Account.findOne({ $or: [{ username: acc.username }, { email: acc.email }] });
                if (exists) {
                    throw new Error(`Username/Email already exists: ${acc.username}`);
                }
                const hashedPassword = await bcrypt.hash(acc.password, salt);
                const accWithHash = { ...acc, password: hashedPassword };

                let newAccount;
                if (acc.role === 'customer') {
                    newAccount = await UserAccount.create(accWithHash);
                    await Cart.create({ account: newAccount._id, items: [] });
                } else if (acc.role === 'employee') {
                    newAccount = await EmployeeAccount.create(accWithHash);
                } else {
                    throw new Error(`Invalid role for user: ${acc.username}`);
                }

                results.push(newAccount);

            } catch (err) {
                errors.push({ username: acc.username, message: err.message });
            }
        }

        return response.status(201).json({
            message: `Processed ${accountsData.length} items`,
            successCount: results.length,
            errorCount: errors.length,
            successData: results,
            errors: errors
        });

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/', verifyAdmin, async (request, response) => {
    try {
        const accounts = await Account.find({}); 
        return response.status(200).json({
            count: accounts.length,
            data: accounts,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.get('/:id', verifyToken, async (request, response) => {
    try {
        const { id } = request.params;
        if (request.user.role !== 'admin' && request.user.id !== id) {
            return response.status(403).json({ message: "Bạn không có quyền xem thông tin người khác!" });
        }
        const account = await Account.findById(id).select('-password'); 
        if (!account) {
            return response.status(404).send({ message: "Account not found!" });
        }
        return response.status(200).json(account);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.put('/:id', verifyToken, async (request, response) => {
    try {
        const { id } = request.params;
        if (request.user.role !== 'admin' && request.user.id !== id) {
            return response.status(403).json({ message: "Bạn không có quyền sửa thông tin người khác!" });
        }
        if (request.body.password) {
            const salt = await bcrypt.genSalt(10);
            request.body.password = await bcrypt.hash(request.body.password, salt);
        }

        const account = await Account.findByIdAndUpdate(id, request.body, { new: true }).select('-password');

        if (!account) {
            return response.status(404).send({ message: "Account not found!" });
        }
        return response.status(200).send({ message: "Account updated successfully!", data: account });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

router.delete('/:id', verifyAdmin, async (request, response) => {
    try {
        const { id } = request.params;
        const account = await Account.findByIdAndUpdate(
            id,
            { trangThai: 'Offline' },
            { new: true }
        );
        if (!account) {
            return response.status(404).send({ message: "Account not found!" });
        }

        return response.status(200).send({ message: "Account has been moved to Offline status!" });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

export default router;