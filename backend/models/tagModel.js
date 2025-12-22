import mongoose from "mongoose";
const tagSchema = mongoose.Schema(
    {
        tenTag: {type: String, require: true},
        trangThai: {type: String, require: true, enum:['Online', 'Offline']}
    },
    {
        timestamps: true
    }
)
export const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);