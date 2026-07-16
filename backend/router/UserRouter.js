const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/auth')
const upload = require('../utils/uploads');

const {SendOtp, VerfiyOTP , Register, Login, GetUserAds, GetAllAdsController, UpdateStoreName, PostAd, EditAd, DeleteAd, AddToCart, RemoveFromCartController, GetUserCartController}  = require('../controller/UserController');

router.post('/send-otp', SendOtp);
router.post('/verify-otp', VerfiyOTP);
router.post('/register', Register);
router.post('/login', Login);
router.get('/GetUserAds', verifyToken, GetUserAds);
router.get('/GetAllAds', GetAllAdsController);
router.post('/update-store-name', verifyToken, UpdateStoreName);
router.post('/post-ad', verifyToken, upload.single('image'), PostAd);
router.post('/editAdByUserId', verifyToken, upload.single('image'), EditAd);
router.post('/DeleteAdByUserId', verifyToken, DeleteAd);
router.post('/AddToCart', verifyToken, AddToCart);
router.post('/RemoveFromCart', verifyToken, RemoveFromCartController);
router.get('/GetUserCart', verifyToken, GetUserCartController);
router.get('/CheckToken',  verifyToken, (req, res) => {
     res.json({
          success: true,
          message: 'Token is valid',
          user: req.user
     })
})
module.exports = router;