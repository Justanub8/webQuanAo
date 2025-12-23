import mongoose from "mongoose";
const productSchema = mongoose.Schema(
    {
        tenSanPham: {type: String, require: true,},
        moTa: {type: String, require: true,},
        trangThai: {type: String, require: true, enum: ['Online', 'Offline']},
        giaBan: {type: Number, require: true,},
        soLuongConLai: {type: Number, require: true,},
        soLuongDaBan: {type: Number,default: 0,require: true,},    
        imageUrl: {type: String, require: true,},
        kichThuoc: {type: String,require: true, enum: ['XS','S','M','L','XL','XXL','3XL']},
        maMauSac: {type: String,require: true,},
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },    
        maChatLieu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: true
        },
        maThuongHieu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        maTag: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
            require: false,
        },
        giamGia: {
            type: Number,
            require: false,
        }
    },
    {
        timestamps: true,
    }
)
export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);