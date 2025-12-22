import mongoose from "mongoose";
const employeeSchema = mongoose.Schema(
    {
        hoTen: {type: String,require: true,},
        email: {type: String,require: true,},
        soDienThoai: {type: String,require: true,},
        ngaySinh: {type: Date,require: true,},
        gioiTinh: {type: String,enum: ["Nam", "Nữ"],require: true,},
        diaChi: {type: String,require: true,},
        trangThai: {type: String,require:true,enum: ['Online', 'Offline'],default: 'Online'},
        chucVu: {type: String,require: true,},
        luong: {type: Number,require: true,},
        thamNien: {type: String,require: true,default: 0,},
        thuong: {type: Number,require: true,default: 0,},
        caLam: {type: String,require: true,},
        ngayNghi: {type: Number,require: true,default: 0},
    },  
    {
        timestamps: true,
    }
)
export const Employee = mongoose.model("Employee", employeeSchema);