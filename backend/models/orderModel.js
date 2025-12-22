import mongoose from "mongoose";
const OrderSchema = mongoose.Schema({
    account: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account", 
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
                required: true,
                min: 1
            },
            size: {
                type: String, 
                required: true
            },
            price: { 
                type: Number, 
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: String,
        default: ""
    },
    phone: { 
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Shipping", "Completed", "Cancelled"],
        default: "Pending"
    },
    vouchers: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voucher",
        required: false
    }
}, { timestamps: true });

export const Order = mongoose.model("Order", OrderSchema);