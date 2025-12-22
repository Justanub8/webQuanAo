import mongoose from "mongoose";
const voucherSchema = mongoose.Schema(
    {
        maGiamGia: {type: String,require: true,unique: true,uppercase: true},
        loaiMa: {type: String,enum: ["%", "VND"],require: true,},
        trangThai: {type: String,require: true,},
        ngayThem: {type: Date,require: true,},
        ngayHetHan: {type: Date,require: true,},
        soLanSuDungMax: {type: Number,require: true,},
        soLanDaSuDung: {type: Number,require: true,default: 0,},
        giaTri: {type: Number,require: true,}
    },
    {
        timestamps: true,
    }
)

export const Voucher = mongoose.model("Voucher", voucherSchema);