import express, { request, response } from "express"
import { PORT, mongoDBUrl } from "./config.js";
import mongoose from "mongoose";
import productRoute from "./routes/productRoute.js";
import vouchersRoute from "./routes/voucherRoute.js";
import customersRoute from './routes/customerRoute.js';
import employeeRoute from './routes/employeeRoute.js';
import orderRoute from './routes/orderRoute.js';
import cartRoute from './routes/cartRoute.js';
import accountRoute from './routes/accountRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import brandRoute from './routes/brandRoute.js';
import tagRoute from './routes/tagRoute.js';
import materialRoute from './routes/materialRoute.js';
import authRoutes from './routes/auth.routes.js';
import cors from 'cors';


const app = express();
app.use(express.json());
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5555',
//     method: ['GET', 'PUT', 'POST', 'DELETE'],
//     allowedHeaders: ['Content-Type'],
// }))
app.get('/', (request,response) => {
    console.log(request);
    return response.status(234).send("Welcome to Mern Stack Tutorial");
});

app.use('/products', productRoute)
app.use('/vouchers', vouchersRoute)
app.use('/customers', customersRoute)
app.use('/employees', employeeRoute)
app.use('/orders', orderRoute)
app.use('/carts', cartRoute)
app.use('/accounts', accountRoute)
app.use('/brands', brandRoute)
app.use('/categories', categoryRoute)
app.use('/tags', tagRoute)
app.use('/materials', materialRoute)
app.use('/api/auth', authRoutes);

mongoose
    .connect(mongoDBUrl)
    .then(() => {
        console.log("App connected to database"); 
        app.listen(PORT , () => {
            console.log(`App is listening to port: ${PORT}`)
        })
    })
    .catch((error) => {
        console.log(error);
    })