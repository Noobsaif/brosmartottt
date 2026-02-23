import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as admin from 'firebase-admin';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

// Initialize App
const app = express();
const PORT = 3000;

// Robust CORS configuration
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size to support Base64 Images (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Firebase Admin Setup
try {
  if (admin.apps.length === 0) {
     try {
       admin.initializeApp({
          projectId: "brosmartott"
       });
     } catch(err) {
       console.log("Firebase default init skipped/failed, mock auth will be used.");
     }
  }
} catch (e) {
  console.warn("Firebase Admin Init Warning:", e);
}

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://Brosmart:brosmartbd@brosmart.bmag19c.mongodb.net/?appName=Brosmart';
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000 
})
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err.message));

// --- Mongoose Schemas ---

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: String,
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  ottName: String,
  packageName: String,
  duration: String,
  price: Number,
  offerPrice: Number,
  description: String,
  features: [String],
  imageUrl: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userUid: String,
  userName: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

const flashSaleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  salePrice: Number,
  endTime: Date,
  isActive: { type: Boolean, default: true }
});
const FlashSale = mongoose.model('FlashSale', flashSaleSchema);

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['fixed', 'percent'], default: 'fixed' },
  discountValue: { type: Number, required: true },
  expiryDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});
const Coupon = mongoose.model('Coupon', couponSchema);

const wishlistSchema = new mongoose.Schema({
  userUid: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  createdAt: { type: Date, default: Date.now }
});
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

const orderSchema = new mongoose.Schema({
  userUid: String,
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  // Snapshot fields in case product is deleted
  productSnapshot: {
    ottName: String,
    packageName: String,
    duration: String
  },
  email: String,
  phone: String,
  paymentMethod: String,
  transactionId: String,
  status: { type: String, default: 'pending' },
  couponCode: String,
  discountAmount: Number,
  finalPrice: Number,
  deliveryDetails: {
    ottEmailOrUsername: String,
    ottPassword: String,
    deliveryMessage: String,
    deliveredAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

const notificationSchema = new mongoose.Schema({
  userUid: String,
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

const invoiceSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userUid: String,
  invoiceNumber: String,
  amount: Number,
  generatedAt: { type: Date, default: Date.now }
});
const Invoice = mongoose.model('Invoice', invoiceSchema);

// --- Middleware ---

const verifyToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  // In production/strict mode, we might want to enforce token presence.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    if (admin.apps.length) {
       try {
         const decodedToken = await admin.auth().verifyIdToken(token);
         req.user = decodedToken;
         try {
           if (mongoose.connection.readyState === 1) {
             const dbUser = await User.findOne({ uid: decodedToken.uid });
             if (dbUser) req.user.role = dbUser.role;
           }
         } catch(dbErr) {
           console.warn("DB Role sync failed in middleware");
         }
         return next();
       } catch (verifyErr) {
         console.warn("Firebase verify failed/dev mode:", verifyErr);
       }
    }
    
    // Fallback: Use headers from client if verification fails (Preview Mode)
    const fallbackUid = req.headers['x-user-uid'];
    const fallbackEmail = req.headers['x-user-email'];
    const fallbackName = req.headers['x-user-name'];

    if (fallbackUid && fallbackEmail) {
       req.user = { 
         uid: fallbackUid, 
         email: fallbackEmail, 
         name: fallbackName || 'User',
         role: fallbackEmail === "samyalhassan807@gmail.com" ? 'admin' : 'user'
       };
       
       // Try to fetch real role from DB if possible
       if (mongoose.connection.readyState === 1) {
          const dbUser = await User.findOne({ uid: fallbackUid });
          if (dbUser) req.user.role = dbUser.role;
       }
    } else {
       // Only fallback to demo user if absolutely no info provided
       req.user = { uid: "mock_uid_12345", email: "demo@example.com", role: "admin" }; 
    }
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).send('Invalid Token');
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Forbidden: Admins only');
  }
};

// --- Routes ---

// ✅ Public routes (NO AUTH)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", dbState: mongoose.connection.readyState });
});

app.post("/api/sync", (req, res) => {
  res.status(200).json({ synced: true });
});

app.get("/api/status", (req, res) => {
  res.json({ online: true });
});

app.get("/api/version", (req, res) => {
  res.json({ version: "1.0.0" });
});

// Auth Sync (Protected but robust)
app.post('/api/auth/sync', verifyToken, async (req: any, res: any) => {
  try {
    const { uid, email, name } = req.user;
    
    if (mongoose.connection.readyState !== 1) {
       return res.json({ 
         uid, email, name: name || 'User', role: email === "samyalhassan807@gmail.com" ? 'admin' : 'user' 
       });
    }

    let user = await User.findOne({ uid });
    
    const adminEmail = "samyalhassan807@gmail.com";
    const isTargetAdmin = email === adminEmail;

    if (!user) {
      const count = await User.countDocuments();
      const role = (count === 0 || isTargetAdmin) ? 'admin' : 'user';
      user = new User({ uid, email, name: name || 'User', role });
      await user.save();
    } else {
      if (isTargetAdmin && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
    }
    res.json(user);
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(200).json({ 
       uid: req.user.uid, 
       email: req.user.email, 
       name: req.user.name || 'User', 
       role: 'user',
       error: "Sync failed, using fallback"
    });
  }
});

// Login Notification
app.post('/api/auth/login-notify', verifyToken, async (req: any, res) => {
  try {
    const notif = new Notification({
      userUid: req.user.uid,
      title: 'Welcome Back! 👋',
      message: `Successfully logged in to your account on ${new Date().toLocaleDateString()}.`
    });
    await notif.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).send('Error creating login notification');
  }
});

// --- ADMIN STATS (DYNAMIC) ---
app.get('/api/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
      orders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.find({ status: { $ne: 'cancelled' } }).select('finalPrice createdAt')
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + (order.finalPrice || 0), 0);
    
    const todayRevenue = orders
      .filter(o => new Date(o.createdAt) >= today)
      .reduce((acc, order) => acc + (order.finalPrice || 0), 0);

    res.json({
      totalRevenue,
      todayRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
      lowStockAlerts: 0 // Placeholder for future logic
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// --- PRODUCT ROUTES ---

app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 0;
    
    let query = Product.find({ isActive: true }).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const products = await query;
    res.json(products);
  } catch(e) { res.status(500).json([]); }
});

app.get('/api/products/admin/all', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch(e) { res.status(500).send('Error'); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product ? res.json(product) : res.status(404).send('Not Found');
  } catch(e) { res.status(404).send('Not Found'); }
});

app.post('/api/products', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (e) { res.status(500).send('Error creating product'); }
});

app.put('/api/products/:id', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) { res.status(500).send('Error updating product'); }
});

// Update: Permanent Delete
app.delete('/api/products/:id', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    await Product.findByIdAndDelete(id);
    // Also remove associated Flash Sales to keep DB clean
    await FlashSale.deleteMany({ productId: id });
    res.json({ message: "Product deleted permanently" });
  } catch (e) { 
    console.error("Delete Product Error:", e);
    res.status(500).send('Error deleting product'); 
  }
});

// --- FLASH SALE ROUTES ---

app.get('/api/flash-sales', async (req, res) => {
  try {
    const sales = await FlashSale.find({ 
      isActive: true,
      endTime: { $gt: new Date() } // Only get active/future sales
    }).populate('productId');
    res.json(sales);
  } catch (e) { res.status(500).send('Error fetching flash sales'); }
});

app.post('/api/flash-sales', verifyToken, isAdmin, async (req: any, res) => {
  try {
    // Optionally: Ensure no duplicate active sale for same product
    await FlashSale.updateMany(
      { productId: req.body.productId, isActive: true }, 
      { isActive: false }
    );
    
    const newSale = new FlashSale(req.body);
    await newSale.save();
    const populated = await newSale.populate('productId');
    res.json(populated);
  } catch (e) { res.status(500).send('Error creating flash sale'); }
});

app.delete('/api/flash-sales/:id', verifyToken, isAdmin, async (req: any, res) => {
  try {
    await FlashSale.findByIdAndDelete(req.params.id);
    res.json({ message: "Flash sale deleted" });
  } catch (e) { res.status(500).send('Error deleting flash sale'); }
});


// --- COUPON ROUTES ---

// Admin: Create Coupon
app.post('/api/coupons', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const newCoupon = new Coupon(req.body);
    await newCoupon.save();
    res.json(newCoupon);
  } catch (e: any) { 
    if(e.code === 11000) return res.status(400).send('Coupon code already exists');
    res.status(500).send('Error creating coupon'); 
  }
});

// Admin: Get Coupons
app.get('/api/coupons', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (e) { res.status(500).send('Error fetching coupons'); }
});

// Admin: Delete Coupon
app.delete('/api/coupons/:id', verifyToken, isAdmin, async (req: any, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (e) { res.status(500).send('Error deleting coupon'); }
});

// User: Verify Coupon
app.post('/api/coupons/verify', verifyToken, async (req: any, res) => {
  try {
    const { code, productId } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) return res.status(404).json({ message: 'Invalid Coupon Code' });
    
    // Check expiry
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'Coupon Expired' });
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon Usage Limit Reached' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if product is in Flash Sale
    const activeFlashSale = await FlashSale.findOne({ 
      productId: productId, 
      isActive: true, 
      endTime: { $gt: new Date() } 
    });

    // Use Flash Sale price as base if exists, otherwise Offer Price
    const basePrice = activeFlashSale ? activeFlashSale.salePrice : product.offerPrice;

    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round((basePrice * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed price
    discountAmount = Math.min(discountAmount, basePrice);
    
    res.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      finalPrice: basePrice - discountAmount
    });
  } catch (e) { res.status(500).send('Error verifying coupon'); }
});

// --- WISHLIST ROUTES ---

app.get('/api/wishlist', verifyToken, async (req: any, res) => {
  try {
    const wishlist = await Wishlist.find({ userUid: req.user.uid }).populate('productId').sort({ createdAt: -1 });
    res.json(wishlist);
  } catch (e) { res.status(500).send('Error fetching wishlist'); }
});

app.post('/api/wishlist', verifyToken, async (req: any, res) => {
  try {
    const { productId } = req.body;
    const existing = await Wishlist.findOne({ userUid: req.user.uid, productId });
    if (existing) return res.status(400).json({ message: 'Already in wishlist' });
    
    const newItem = new Wishlist({ userUid: req.user.uid, productId });
    await newItem.save();
    const populated = await newItem.populate('productId');
    res.json(populated);
  } catch (e) { res.status(500).send('Error adding to wishlist'); }
});

app.delete('/api/wishlist/:productId', verifyToken, async (req: any, res) => {
  try {
    await Wishlist.findOneAndDelete({ userUid: req.user.uid, productId: req.params.productId });
    res.json({ message: 'Removed from wishlist' });
  } catch (e) { res.status(500).send('Error removing from wishlist'); }
});

// --- ORDER ROUTES (Updated) ---

app.post('/api/orders', verifyToken, async (req: any, res) => {
  try {
    const { productId, paymentMethod, transactionId, phone, couponCode } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    // Check for active Flash Sale
    const activeFlashSale = await FlashSale.findOne({ 
      productId: productId, 
      isActive: true, 
      endTime: { $gt: new Date() } 
    });

    let finalPrice = activeFlashSale ? activeFlashSale.salePrice : product.offerPrice;
    let discountAmount = 0;

    // Apply Coupon Logic Server-Side for Security
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon) {
         // Re-validate coupon validity
         const isValid = (!coupon.expiryDate || new Date() <= new Date(coupon.expiryDate)) &&
                         (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);
         
         if (isValid) {
            if (coupon.discountType === 'percent') {
              discountAmount = Math.round((finalPrice * coupon.discountValue) / 100);
            } else {
              discountAmount = coupon.discountValue;
            }
            discountAmount = Math.min(discountAmount, finalPrice);
            finalPrice -= discountAmount;

            // Increment usage
            coupon.usedCount += 1;
            await coupon.save();
         }
      }
    }

    const newOrder = new Order({
      userUid: req.user.uid,
      productId,
      // Save snapshot of product details
      productSnapshot: {
        ottName: product.ottName,
        packageName: product.packageName,
        duration: product.duration
      },
      email: req.user.email,
      phone,
      paymentMethod,
      transactionId,
      couponCode: discountAmount > 0 ? couponCode : undefined,
      discountAmount,
      finalPrice,
      status: 'pending'
    });

    await newOrder.save();
    
    // Create Notification for Admin (optional - simplified by letting admin poll)
    // Create Notification for User
    const notif = new Notification({
       userUid: req.user.uid,
       title: 'Order Received 🕐',
       message: `We received your order for ${product.ottName}. We will verify your payment and deliver shortly.`
    });
    await notif.save();

    res.json(newOrder);
  } catch (e) { 
    console.error(e);
    res.status(500).send('Error creating order'); 
  }
});

app.get('/api/orders/my-orders', verifyToken, async (req: any, res) => {
  try {
    const orders = await Order.find({ userUid: req.user.uid }).populate('productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).send('Error fetching orders'); }
});

app.get('/api/orders/admin/all', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const orders = await Order.find().populate('productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).send('Error fetching admin orders'); }
});

// --- DELIVERY & ACTION SYSTEM ---

// Cancel Order
app.post('/api/orders/:id/cancel', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, {
      status: 'cancelled',
      deliveryDetails: { deliveryMessage: reason } 
    }, { new: true }).populate('productId');

    if (!order) return res.status(404).send('Order not found');

    // Create Notification
    const notif = new Notification({
      userUid: order.userUid,
      title: 'Order Cancelled ❌',
      message: `Your order for ${ order.productSnapshot?.ottName || (order.productId as any)?.ottName || 'Subscription' } was cancelled.${reason ? ` Reason: ${reason}` : ''}`
    });
    await notif.save();

    res.json(order);
  } catch (e) {
    console.error("Cancel Error:", e);
    res.status(500).send('Error cancelling order');
  }
});

// Deliver Order
app.post('/api/orders/:id/deliver', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const { ottEmailOrUsername, ottPassword, deliveryMessage } = req.body;
    
    const order = await Order.findByIdAndUpdate(req.params.id, {
      status: 'delivered',
      deliveryDetails: {
        ottEmailOrUsername,
        ottPassword,
        deliveryMessage,
        deliveredAt: new Date()
      }
    }, { new: true }).populate('productId');
    
    if (!order) return res.status(404).send('Order not found');

    const invoiceNumber = `INV-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice = new Invoice({
      orderId: order._id,
      userUid: order.userUid,
      invoiceNumber,
      // Use the final price (after discount) for the invoice
      amount: (order as any).finalPrice || (order.productId as any)?.offerPrice || 0
    });
    await newInvoice.save();

    const notif = new Notification({
      userUid: order.userUid,
      title: 'Order Delivered! 🎉',
      message: `Your ${ order.productSnapshot?.ottName || (order.productId as any)?.ottName || 'Subscription' } is ready. Check your dashboard.`
    });
    await notif.save();
    
    res.json({ order, invoice: newInvoice });
  } catch (e) {
    console.error("Delivery Error:", e);
    res.status(500).send('Error delivering order');
  }
});

// --- USER FEATURES ---

app.get('/api/notifications', verifyToken, async (req: any, res) => {
  try {
    const notifs = await Notification.find({ userUid: req.user.uid }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (e) { res.status(500).send('Error fetching notifications'); }
});

app.put('/api/notifications/:id/read', verifyToken, async (req: any, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch(e) { res.status(500).send('Error'); }
});

app.get('/api/invoices/my-invoices', verifyToken, async (req: any, res) => {
  try {
    const invoices = await Invoice.find({ userUid: req.user.uid }).populate('orderId').sort({ generatedAt: -1 });
    res.json(invoices);
  } catch(e) { 
    console.error(e);
    res.status(500).send('Error fetching invoices'); 
  }
});

// --- REVIEW ROUTES ---

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    res.status(500).send('Error fetching reviews');
  }
});

app.post('/api/reviews', verifyToken, async (req: any, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Check if user already reviewed
    const existing = await Review.findOne({ productId, userUid: req.user.uid });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });

    const newReview = new Review({
      productId,
      userUid: req.user.uid,
      userName: req.user.name || 'User',
      rating,
      comment
    });
    await newReview.save();

    // Update Product Stats
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count
      });
    }

    res.json(newReview);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error adding review');
  }
});

app.delete('/api/reviews/:id', verifyToken, isAdmin, async (req: any, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (review) {
      // Update Product Stats
      const stats = await Review.aggregate([
        { $match: { productId: review.productId } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      await Product.findByIdAndUpdate(review.productId, {
        averageRating: stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0,
        reviewCount: stats.length > 0 ? stats[0].count : 0
      });
    }
    res.json({ message: 'Review deleted' });
  } catch (e) {
    res.status(500).send('Error deleting review');
  }
});

// Vite Middleware (MUST be after API routes)
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

if (process.env.NODE_ENV !== 'production' || process.env.PORT) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;