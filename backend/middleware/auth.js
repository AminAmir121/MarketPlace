const jwt = require('jsonwebtoken');

/**
 * JWT Verification Middleware
 * Protects routes by checking for a valid JWT token in the Authorization header.
 * 
 * Usage:
 *   router.get('/protected-route', verifyToken, controllerFunction);
 * 
 * How it works:
 *   1. Checks for "Authorization: Bearer <token>" in request headers
 *   2. Verifies the JWT signature using the secret key
 *   3. If valid, attaches decoded user data to req.user (id, email, iat, exp)
 *   4. If invalid/missing, returns 401 with "You are not loggedin" message
 * 
 * Frontend should:
 *   - Store token from login response
 *   - Send it in every API request: headers.Authorization = "Bearer " + token
 *   - On 401 response, redirect to login page
 */

const verifyToken = (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'You are not loggedin',
        code: 'NO_TOKEN',
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not loggedin',
        code: 'INVALID_FORMAT',
      });
    }

    // Verify JWT
    const secret = process.env.JWT_SECRET || 'replace_this_with_real_secret';
    const decoded = jwt.verify(token, secret);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    // Handle expired or invalid tokens
    let errorMessage = 'You are not loggedin';
    let code = 'INVALID_TOKEN';

    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Your session has expired. Please login again.';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token. Please login again.';
      code = 'MALFORMED_TOKEN';
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
      code: code,
    });
  }
};

module.exports = { verifyToken };
