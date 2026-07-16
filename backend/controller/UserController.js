const { generateAndSendOTP, verifyOTP: verifyOtpModel } = require('../model/OTP');

const {RegisterUser, GetUserByEmail, UpdateUserStoreName, DeleteAdByUserId, EditAdByUserId, GetAllAds, GetAdsByUserId, PostAd: PostAdModel, AddToCart: AddToCartModel, RemoveFromCart: RemoveFromCartModel, GetUserCart: GetUserCartModel} = require('../model/User');
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
          const statusCode = error.message.includes('required') || error.message.includes('authentication') ? 400 : 500;

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

module.exports = { SendOtp, VerfiyOTP, Register, Login, GetUserAds, GetAllAdsController, UpdateStoreName, PostAd, EditAd, DeleteAd, AddToCart, RemoveFromCartController, GetUserCartController };