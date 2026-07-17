const { generateAndSendOTP, verifyOTP: verifyOtpModel } = require('../model/OTP');

const {RegisterUser, GetUserByEmail, UpdateUserStoreName, DeleteAdByUserId, EditAdByUserId, GetAllAds, GetAdsByUserId, PostAd: PostAdModel, AddToCart: AddToCartModel, RemoveFromCart: RemoveFromCartModel, GetUserCart: GetUserCartModel, PlaceOrder: PlaceOrderModel, GetUserOrders: GetUserOrdersModel, AddComment: AddCommentModel, GetProductComments: GetProductCommentsModel, GetVendorAds: GetVendorAdsModel, SubmitReport: SubmitReportModel, GetUserRole: GetUserRoleModel, GetAllVendorStores: GetAllVendorStoresModel, BanStore: BanStoreModel, GetAdminReports: GetAdminReportsModel, ResolveReport: ResolveReportModel, GetVendorOrders: GetVendorOrdersModel, MarkOrderReadyToShip: MarkOrderReadyToShipModel, RequestPasswordReset: RequestPasswordResetModel, ResetPassword: ResetPasswordModel} = require('../model/User');
const jwt = require('jsonwebtoken');

const SendOtp = async (req, res) => {

     try {

          const { email} = req.body;

          const result = await generateAndSendOTP(email);

          if (result && result.success === true) {

               res.status(200).json({
                    success: true,
                    message: "OTP sent successfully. Please verify your email to complete registration."
               })
          } else {
               res.status(500).json({
                    success: false,
                    message: "Failed to send OTP. Please try again later."
               })
          }

     } catch (error) {
          console.error('Error sending OTP:', error);
          res.status(500).json({
               success: false,
               message: "An error occurred while sending the OTP."
          });
     }
}

const VerfiyOTP = async (req, res) => {
     try {
          await verifyOtpModel(req, res);
     } catch (error) {
          console.error('Error verifying OTP:', error);
          res.status(500).json({
               success: false,
               message: "An error occurred while verifying the OTP."
          });
     }
}

const Register = async (req,res)=>{
     try {
          const result = await RegisterUser(req);
          return res.status(200).json({
               success: true,
               message: "User registered successfully",
               data: result
          })
     } catch (error) {
          console.error('Error registering user:', error);
          res.status(500).json({
               success: false,
               message: "An error occurred while registering the user."
          });
     }
}

const Login = async (req, res) => {
     try {
          const { email, password } = req.body;

          if (!email || !password) {
               return res.status(400).json({ success: false, message: 'Email and password are required.' });
          }

          // Get user by email (model extracts email from req.body)
          const user = await GetUserByEmail({ body: { email } });

          if (!user) {
               return res.status(401).json({ success: false, message: 'Invalid credentials.' });
          }

          // NOTE: your RegisterUser currently stores passwords as plain text.
          // Compare directly for now; consider hashing with bcrypt in future.
          if (String(user.password) !== String(password)) {
               return res.status(401).json({ success: false, message: 'Invalid credentials.' });
          }

          const userId = user.userid || user.id || user.userId || user.ID || null;
          const payload = {
               id: userId,
               userId,
               userid: userId,
               email: user.email
          };
          const secret = process.env.JWT_SECRET || 'replace_this_with_real_secret';
          const token = jwt.sign(payload, secret, { expiresIn: '7d' });

          // Remove sensitive fields
          const { password: _pw, ...safeUser } = user;

          return res.status(200).json({ success: true, message: 'Login successful', token, user: safeUser });
     } catch (error) {
          console.error('Login error:', error);
          return res.status(500).json({ success: false, message: 'Server error' });
     }
};

const CheckSession = async (req,res)=>{
     
}

const GetUserAds = async (req, res) => {
     try {
          const ads = await GetAdsByUserId(req);

          return res.status(200).json({
               success: true,
               data: ads
          });
     } catch (error) {
          console.error('Error fetching user ads:', error);
          const statusCode = error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "An error occurred while fetching your ads."
          });
     }
}

const GetAllAdsController = async (req, res) => {
     try {
          const ads = await GetAllAds();

          return res.status(200).json({
               success: true,
               data: ads
          });
     } catch (error) {
          console.error('Error fetching all ads:', error);
          return res.status(500).json({
               success: false,
               message: "Failed to fetch products."
          });
     }
}

const UpdateStoreName = async (req, res) => {
     try {
          const result = await UpdateUserStoreName(req);

          return res.status(200).json({
               success: true,
               message: "Store name updated successfully.",
               data: result
          });
     } catch (error) {
          console.error('Failed to update store name.');
          const statusCode = error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: "Failed to save store name."
          });
     }
}

const PostAd = async (req, res) => {
     try {
          const result = await PostAdModel(req);

          return res.status(201).json({
               success: true,
               message: "Ad posted successfully.",
               data: result
          });
     } catch (error) {
          console.error('Error posting ad:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "An error occurred while posting the ad."
          });
     }
}

const EditAd = async (req, res) => {
     try {
          const result = await EditAdByUserId(req);

          return res.status(200).json({
               success: true,
               message: "Ad updated successfully.",
               data: result
          });
     } catch (error) {
          console.error('Error editing ad:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') || error.message.includes('not found') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to update the ad."
          });
     }
}

const DeleteAd = async (req, res) => {
     try {
          const result = await DeleteAdByUserId(req);

          return res.status(200).json({
               success: true,
               message: "Ad deleted successfully.",
               data: result
          });
     } catch (error) {
          console.error('Error deleting ad:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') || error.message.includes('not found') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to delete ad."
          });
     }
}

const AddToCart = async (req, res) => {
     try {
          const result = await AddToCartModel(req);

          return res.status(200).json({
               success: true,
               message: result.added ? "Added to cart." : "Item is already in your cart.",
               data: result
          });
     } catch (error) {
          console.error('Error adding to cart:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') || error.message.includes('own product') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to add item to cart."
          });
     }
};

const RemoveFromCartController = async (req, res) => {
     try {
          const result = await RemoveFromCartModel(req);

          return res.status(200).json({
               success: true,
               message: result.removed ? "Removed from cart." : "Item was not in your cart.",
               data: result
          });
     } catch (error) {
          console.error('Error removing from cart:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to remove item from cart."
          });
     }
};

const GetUserCartController = async (req, res) => {
     try {
          const items = await GetUserCartModel(req);

          return res.status(200).json({
               success: true,
               data: items
          });
     } catch (error) {
          console.error('Error fetching user cart:', error);
          const statusCode = error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to fetch your cart."
          });
     }
};

const PlaceOrderController = async (req, res) => {
     try {
          const result = await PlaceOrderModel(req);

          return res.status(201).json({
               success: true,
               message: "Order placed successfully.",
               data: result
          });
     } catch (error) {
          console.error('Error placing order:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') || error.message.includes('own product') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to place order."
          });
     }
};

const GetUserOrdersController = async (req, res) => {
     try {
          const orders = await GetUserOrdersModel(req);

          return res.status(200).json({
               success: true,
               data: orders
          });
     } catch (error) {
          console.error('Error fetching user orders:', error);
          const statusCode = error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to fetch your orders."
          });
     }
};

const AddCommentController = async (req, res) => {
     try {
          const result = await AddCommentModel(req);

          return res.status(201).json({
               success: true,
               message: "Comment posted successfully.",
               data: result
          });
     } catch (error) {
          console.error('Error posting comment:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to post comment."
          });
     }
};

const GetProductCommentsController = async (req, res) => {
     try {
          const comments = await GetProductCommentsModel(req);

          return res.status(200).json({
               success: true,
               data: comments
          });
     } catch (error) {
          console.error('Error fetching comments:', error);
          return res.status(400).json({
               success: false,
               message: error.message || "Failed to fetch comments."
          });
     }
};

const GetVendorAdsController = async (req, res) => {
     try {
          const vendorId = req.query?.vendorId;
          const result = await GetVendorAdsModel(vendorId);

          return res.status(200).json({
               success: true,
               data: result
          });
     } catch (error) {
          console.error('Error fetching vendor ads:', error);
          const statusCode = error.message.includes('required') || error.message.includes('not found') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to fetch vendor's products."
          });
     }
};

const SubmitReportController = async (req, res) => {
     try {
          const result = await SubmitReportModel(req);

          return res.status(201).json({
               success: true,
               message: "Report submitted successfully.",
               data: result
          });
     } catch (error) {
          console.error('Error submitting report:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to submit report."
          });
     }
};

const GetUserRoleController = async (req, res) => {
     try {
          const result = await GetUserRoleModel(req);

          return res.status(200).json({
               success: true,
               data: result
          });
     } catch (error) {
          console.error('Error fetching user role:', error);
          const statusCode = error.message.includes('authentication') || error.message.includes('not found') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to fetch user role."
          });
     }
};

const GetAllVendorStoresController = async (req, res) => {
     try {
          const result = await GetAllVendorStoresModel(req);

          return res.status(200).json({
               success: true,
               data: result
          });
     } catch (error) {
          console.error('Error fetching vendor stores:', error);
          const statusCode = error.message.includes('Admin access') || error.message.includes('authentication') ? 403 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to fetch vendor stores."
          });
     }
};

const BanStoreController = async (req, res) => {
     try {
          const result = await BanStoreModel(req);

          return res.status(200).json({
               success: true,
               message: "Store banned and vendor removed.",
               data: result
          });
     } catch (error) {
          console.error('Error banning store:', error);
          const statusCode = error.message.includes('Admin access') || error.message.includes('authentication') ? 403 : (error.message.includes('required') || error.message.includes('not found') ? 400 : 500);

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to ban store."
          });
     }
};

const GetAdminReportsController = async (req, res) => {
     try {
          const result = await GetAdminReportsModel(req);

          return res.status(200).json({
               success: true,
               data: result
          });
     } catch (error) {
          console.error('Error fetching admin reports:', error);
          const statusCode = error.message.includes('Admin access') || error.message.includes('authentication') ? 403 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to fetch reports."
          });
     }
};

const ResolveReportController = async (req, res) => {
     try {
          const result = await ResolveReportModel(req);

          return res.status(200).json({
               success: true,
               message: "Report marked as resolved.",
               data: result
          });
     } catch (error) {
          console.error('Error resolving report:', error);
          const statusCode = error.message.includes('Admin access') || error.message.includes('authentication') ? 403 : (error.message.includes('required') ? 400 : 500);

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to resolve report."
          });
     }
};

const GetVendorOrdersController = async (req, res) => {
     try {
          const result = await GetVendorOrdersModel(req);

          return res.status(200).json({
               success: true,
               data: result
          });
     } catch (error) {
          console.error('Error fetching vendor orders:', error);
          const statusCode = error.message.includes('authentication') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to fetch vendor orders."
          });
     }
};

const MarkOrderReadyToShipController = async (req, res) => {
     try {
          const result = await MarkOrderReadyToShipModel(req);

          return res.status(200).json({
               success: true,
               message: "Order marked as ready to ship.",
               data: result
          });
     } catch (error) {
          console.error('Error marking order ready to ship:', error);
          const statusCode = error.message.includes('required') || error.message.includes('authentication') || error.message.includes('not found') ? 400 : 500;

          return res.status(statusCode).json({
               success: false,
               message: error.message || "Failed to update order."
          });
     }
};

const RequestPasswordResetController = async (req, res) => {
     try {
          await RequestPasswordResetModel(req);
          const result = await generateAndSendOTP(req.body.email);

          if (result && result.success === true) {
               return res.status(200).json({
                    success: true,
                    message: "OTP sent to your email. Please check and enter it to reset your password."
               });
          }

          return res.status(500).json({
               success: false,
               message: "Failed to send OTP. Please try again later."
          });
     } catch (error) {
          console.error('Error requesting password reset:', error);
          return res.status(400).json({
               success: false,
               message: error.message || "Failed to request password reset."
          });
     }
};

const ResetPasswordController = async (req, res) => {
     try {
          const result = await ResetPasswordModel(req);

          return res.status(200).json({
               success: true,
               message: "Password reset successfully.",
               data: result
          });
     } catch (error) {
          console.error('Error resetting password:', error);
          return res.status(400).json({
               success: false,
               message: error.message || "Failed to reset password."
          });
     }
};

module.exports = { SendOtp, VerfiyOTP, Register, Login, GetUserAds, GetAllAdsController, UpdateStoreName, PostAd, EditAd, DeleteAd, AddToCart, RemoveFromCartController, GetUserCartController, PlaceOrderController, GetUserOrdersController, AddCommentController, GetProductCommentsController, GetVendorAdsController, SubmitReportController, GetUserRoleController, GetAllVendorStoresController, BanStoreController, GetAdminReportsController, ResolveReportController, GetVendorOrdersController, MarkOrderReadyToShipController, RequestPasswordResetController, ResetPasswordController };