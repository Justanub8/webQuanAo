import mongoose  from "mongoose";
const AccountSchema = mongoose.Schema(
    {
        username: {type: String, require: true},
        password: {type: String, require: true},
        email: {type: String, require: true},
        trangThai: {type: String, require: true, enum: ["Online", "Offline"]},
        role: {type: String, enum:["customer", "employee",'admin'], require: true},
    },
    {
        timestamps: true,
    }
)
export const Account = mongoose.model("Account", AccountSchema);

export const UserAccount = Account.discriminator(
    "customer",
    new mongoose.Schema({
        lichSu: {type: String, default: ''},
        soDuTaiKhoan: {type: Number, default: 0},
        diemTinNhiem: {type: Number, default: 0}, 
    })
);

export const EmployeeAccount = Account.discriminator(
    "employee",
    new mongoose.Schema({
        chucVu: String,
    })
);