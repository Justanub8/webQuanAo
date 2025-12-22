import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(" ")[1]; 

        jwt.verify(token, process.env.JWT_SECRET || 'secretkey123', (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Token không hợp lệ!" });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ message: "Bạn chưa xác thực (Chưa đăng nhập)!" });
    }
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: "Bạn không có quyền Admin!" });
        }
    });
};