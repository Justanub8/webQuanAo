import mongoose from "mongoose";
const brandSchema = mongoose.Schema(
    {
        tenBrand: {type: String, require: true},
        trangThai: {type: String, require: true, enum: ['Online', 'Offline']}
    },
    {
        timestamps: true
    }
)
export const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);