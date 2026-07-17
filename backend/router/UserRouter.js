const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/auth')
const upload = require('../utils/uploads');

const {SendOtp, VerfiyOTP , Register, Login, GetUserAds, GetAllAdsController, UpdateStoreName, PostAd, EditAd, DeleteAd, AddToCart, RemoveFromCartController, GetUserCartController, PlaceOrderController, GetUserOrdersController, AddCommentController, GetProductCommentsController, GetVendorAdsController, SubmitReportController, GetUserRoleController, GetAllVendorStoresController, BanStoreController, GetAdminReportsController, ResolveReportController, GetVendorOrdersController, MarkOrderReadyToShipController, RequestPasswordResetController, ResetPasswordController, GetPendingAdsController, ApproveAdController, RejectAdController, GetUserReportsController}  = require('../controller/UserController');

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
router.post('/PlaceOrder', verifyToken, PlaceOrderController);
router.get('/GetUserOrders', verifyToken, GetUserOrdersController);
router.post('/AddComment', verifyToken, AddCommentController);
router.get('/GetProductComments', GetProductCommentsController);
router.get('/GetVendorAds', GetVendorAdsController);
router.post('/SubmitReport', verifyToken, SubmitReportController);
router.get('/GetUserRole', verifyToken, GetUserRoleController);
router.get('/GetVendorOrders', verifyToken, GetVendorOrdersController);
router.post('/MarkOrderReadyToShip', verifyToken, MarkOrderReadyToShipController);
router.post('/RequestPasswordReset', RequestPasswordResetController);
router.post('/ResetPassword', ResetPasswordController);
router.get('/GetPendingAds', verifyToken, GetPendingAdsController);
router.post('/ApproveAd', verifyToken, ApproveAdController);
router.post('/RejectAd', verifyToken, RejectAdController);
router.get('/GetUserReports', verifyToken, GetUserReportsController);
router.get('/GetAllVendorStores', verifyToken, GetAllVendorStoresController);
router.post('/BanStore', verifyToken, BanStoreController);
router.get('/GetAdminReports', verifyToken, GetAdminReportsController);
router.post('/ResolveReport', verifyToken, ResolveReportController);
router.get('/CheckToken',  verifyToken, (req, res) => {
     res.json({
          success: true,
          message: 'Token is valid',
          user: req.user
     })
})
module.exports = router;