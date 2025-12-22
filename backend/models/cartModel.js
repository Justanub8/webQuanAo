import mongoose from "mongoose";
const CartSchema = mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            price: { 
                type: Number
            },
            size: {type: String, require: true}
        }
    ],
    totalPrice: { 
        type: Number,
        default: 0
    }
}, { timestamps: true }); 

export const Cart = mongoose.model("Cart", CartSchema);