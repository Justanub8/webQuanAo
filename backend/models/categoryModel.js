import mongoose from "mongoose";
const categorySchema = mongoose.Schema(
    {
        tenCategory:{type: String, require: true},
        trangThai:{type: String, require: true, enum: ['Online', 'Offline']}
    },
    {
        timestamps: true,
    }
)
export const Category = mongoose.models.Category || mongoose.model("Category" , categorySchema);