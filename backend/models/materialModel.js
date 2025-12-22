import mongoose from "mongoose";
const materialSchema = mongoose.Schema(
    {
        tenMaterial: {type: String, require: true},
        trangThai: { 
            type: String, 
            required: true, 
            enum: ['Online', 'Offline'],
            default: 'Online'
        }
    },
    {
        timestamps: true
    }
)
export const Material = mongoose.models.Material || mongoose.model("Material", materialSchema);