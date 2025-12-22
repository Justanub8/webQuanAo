import mongoose from "mongoose";
const customerSchema = mongoose.Schema(
    {
        hoTen: {type: String,require: true,},
        email: {type: String,require: true,},
        soDienThoai: {type: String,require: true,},
        ngaySinh: {type: Date,require: true,},
        gioiTinh: {type: String,enum: ["Nam", "Nữ"],require: true,},
        diaChi: {type: String,require: true,},
        trangThai: {type: String,require:true, enum:["Online" , 'Offline']}
    },  
    {
        timestamps: true,
    }
)
export const Customer = mongoose.model("Customer", customerSchema);