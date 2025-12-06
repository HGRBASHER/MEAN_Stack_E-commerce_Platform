const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const app = express();

app.use(require('./midlewares/cors.middleware'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const connectDB = require('./config/db.config');
connectDB();
app.use('/auth', require('./routes/auth.routes'));
app.use('/user', require('./routes/user.routes'));
app.use('/cart', require('./routes/cart.routes'));
app.use('/category', require('./routes/category.routes'));
app.use('/subcategory', require('./routes/subcategory.routes'));
app.use('/product', require('./routes/product.routes'));
app.use('/order', require('./routes/order.routes'));
app.use('/report', require('./routes/report.routes'));
app.use('/settings', require('./routes/settings.routes'));
app.use('/footer', require('./routes/footer.routes'));
app.use('/testimonials', require('./routes/testimonial.routes'));

const AppError = require('./utilities/app-error.utils');
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});


const errorMiddleware = require('./midlewares/error-handler.middleware');
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
