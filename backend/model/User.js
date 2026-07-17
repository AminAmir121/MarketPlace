const db = require('../utils/db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const getResolvedUserId = (req, fallbackUserId = null) => {
     const fromBody = req.body?.userId || req.body?.user_id || req.body?.userid || fallbackUserId || null;
     const fromUser = req.user?.id || req.user?.userId || req.user?.user_id || req.user?.userid || null;

     if (fromUser) return fromUser;
     if (fromBody) return fromBody;

     const authHeader = req.headers?.authorization || req.headers?.Authorization || req.get?.('authorization') || req.get?.('Authorization');
     if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const secret = process.env.JWT_SECRET || 'replace_this_with_real_secret';
          try {
               const decoded = jwt.verify(token, secret);
               return decoded?.id || decoded?.userId || decoded?.user_id || decoded?.userid || null;
          } catch (tokenError) {
               console.warn('JWT verification failed while resolving user id:', tokenError.message);
          }
     }

     return null;
};

const ensureCartTable = async () => {
     await db.execute(`
          CREATE TABLE IF NOT EXISTS cart (
               userId INT NOT NULL,
               productId INT NOT NULL,
               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               UNIQUE KEY unique_cart_item (userId, productId)
          )
     `);
};

const RegisterUser = async (req,res) => {
     const { name, email, password } = req.body;
     try {
          const query = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
          const result = await db.execute(query, [name, email, password]);

          return result;


     } catch (error) {
          res.status(500).json({
               success: false,
               message: "An error occurred while registering the user."
          });
     }
}

const GetUserByEmail = async (req)=>{
     const { email } = req.body;
     try {
          const query = "SELECT * FROM users WHERE email = ?";
          const [rows] = await db.execute(query, [email]);
          return rows[0];
     } catch (error) {
          throw new Error("An error occurred while fetching user by email.");
     }
}

const ensureUsersStoreNameColumn = async () => {
     const [rows] = await db.execute(`
          SELECT COUNT(*) AS columnCount
          FROM information_schema.columns
          WHERE table_schema = DATABASE()
            AND table_name = 'users'
            AND column_name = 'storeName'
     `);

     if (rows[0].columnCount === 0) {
          await db.execute("ALTER TABLE users ADD COLUMN storeName VARCHAR(255) DEFAULT NULL");
     }
};

const UpdateUserStoreName = async (req) => {
     const { userId, storeName } = req.body;

     if (!userId) {
          throw new Error("User authentication is required to update the store name.");
     }

     await ensureUsersStoreNameColumn();

     const query = "UPDATE users SET storeName = ? WHERE userid = ?";
     const [result] = await db.execute(query, [storeName || null, userId]);

     return {
          success: true,
          updated: result.affectedRows > 0,
          userId
     };
}

const DeleteAdByUserId = async (req) => {
     const { adId, id, productId, userId: bodyUserId } = req.body;
     const resolvedAdId = adId || id || productId || null;

     let userId = req.user?.id || req.user?.userId || req.user?.user_id || req.user?.userid || bodyUserId || req.body?.userId || req.body?.user_id || req.body?.userid || null;

     if (!userId) {
          const authHeader = req.headers?.authorization || req.headers?.Authorization || req.get?.('authorization') || req.get?.('Authorization');
          if (authHeader && authHeader.startsWith('Bearer ')) {
               const token = authHeader.split(' ')[1];
               const secret = process.env.JWT_SECRET || 'replace_this_with_real_secret';
               try {
                    const decoded = jwt.verify(token, secret);
                    userId = decoded?.id || decoded?.userId || decoded?.user_id || decoded?.userid || null;
               } catch (tokenError) {
                    console.warn('JWT verification failed in delete-ad:', tokenError.message);
               }
          }
     }

     if (!resolvedAdId) {
          throw new Error("Ad id is required to delete the listing.");
     }

     if (!userId) {
          throw new Error("User authentication is required to delete the ad.");
     }

     const query = "DELETE FROM userads WHERE userId = ? AND productId = ?";
     const [result] = await db.execute(query, [userId, resolvedAdId]);

     if (result.affectedRows === 0) {
          throw new Error("Ad not found or you are not allowed to delete it.");
     }

     return {
          success: true,
          id: resolvedAdId,
          userid: userId
     };
}

const assertNotOwnProduct = async (productId, userId) => {
     const [rows] = await db.execute("SELECT userId FROM userads WHERE productId = ?", [productId]);
     if (rows.length > 0 && String(rows[0].userId) === String(userId)) {
          throw new Error("This is your own product, you cannot buy or add it to cart.");
     }
};

const AddToCart = async (req) => {
     const { productId, id, itemId } = req.body;
     const resolvedProductId = productId || id || itemId || null;
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!resolvedProductId) {
          throw new Error("Product id is required to add to cart.");
     }

     if (!userId) {
          throw new Error("User authentication is required to add to cart.");
     }

     await assertNotOwnProduct(resolvedProductId, userId);

     await ensureCartTable();

     const [existingRows] = await db.execute("SELECT * FROM cart WHERE userId = ? AND productId = ?", [userId, resolvedProductId]);
     if (existingRows.length > 0) {
          return {
               success: true,
               added: false,
               exists: true,
               userId,
               productId: resolvedProductId
          };
     }

     await db.execute("INSERT INTO cart (userId, productId) VALUES (?, ?)", [userId, resolvedProductId]);

     return {
          success: true,
          added: true,
          exists: false,
          userId,
          productId: resolvedProductId
     };
};

const RemoveFromCart = async (req) => {
     const { productId, id, itemId } = req.body;
     const resolvedProductId = productId || id || itemId || null;
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!resolvedProductId) {
          throw new Error("Product id is required to remove from cart.");
     }

     if (!userId) {
          throw new Error("User authentication is required to remove from cart.");
     }

     await ensureCartTable();

     const [result] = await db.execute("DELETE FROM cart WHERE userId = ? AND productId = ?", [userId, resolvedProductId]);

     return {
          success: true,
          removed: result.affectedRows > 0,
          userId,
          productId: resolvedProductId
     };
};

const GetUserCart = async (req) => {
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!userId) {
          throw new Error("User authentication is required to fetch your cart.");
     }

     await ensureCartTable();
     await db.execute(`
          CREATE TABLE IF NOT EXISTS userads (
               productId INT AUTO_INCREMENT PRIMARY KEY,
               userId INT NOT NULL,
               title VARCHAR(255) NOT NULL,
               price DECIMAL(10, 2) NOT NULL,
               storeName VARCHAR(255) NOT NULL,
               description TEXT NOT NULL,
               image_path VARCHAR(255) DEFAULT NULL,
               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
     `);

     const query = `
          SELECT
               c.productId AS id,
               COALESCE(a.title, 'Product unavailable') AS name,
               COALESCE(a.price, 0) AS price,
               COALESCE(a.storeName, 'Vendor') AS store,
               COALESCE(a.description, '') AS description,
               COALESCE(a.image_path, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80') AS image,
               1 AS qty,
               4.5 AS rating,
               c.createdAt
          FROM cart c
          LEFT JOIN userads a ON a.productId = c.productId
          WHERE c.userId = ?
          ORDER BY c.createdAt DESC
     `;

     const [rows] = await db.execute(query, [userId]);

     return rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          store: row.store,
          description: row.description,
          image: row.image,
          qty: Number(row.qty),
          rating: Number(row.rating),
          createdAt: row.createdAt
     }));
};

const ensureOrdersTable = async () => {
     await db.execute(`
          CREATE TABLE IF NOT EXISTS orders (
               id INT AUTO_INCREMENT PRIMARY KEY,
               userId INT NOT NULL,
               productId INT NOT NULL,
               status VARCHAR(50) NOT NULL DEFAULT 'processing',
               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
     `);
};

const PlaceOrder = async (req) => {
     const { productId, id, itemId } = req.body;
     const resolvedProductId = productId || id || itemId || null;
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!resolvedProductId) {
          throw new Error("Product id is required to place an order.");
     }

     if (!userId) {
          throw new Error("User authentication is required to place an order.");
     }

     await assertNotOwnProduct(resolvedProductId, userId);

     await ensureOrdersTable();

     const [result] = await db.execute(
          "INSERT INTO orders (userId, productId, status) VALUES (?, ?, 'processing')",
          [userId, resolvedProductId]
     );

     return {
          success: true,
          id: result.insertId,
          userId,
          productId: resolvedProductId,
          status: "processing"
     };
};

const GetUserOrders = async (req) => {
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!userId) {
          throw new Error("User authentication is required to fetch your orders.");
     }

     await ensureOrdersTable();
     await db.execute(`
          CREATE TABLE IF NOT EXISTS userads (
               productId INT AUTO_INCREMENT PRIMARY KEY,
               userId INT NOT NULL,
               title VARCHAR(255) NOT NULL,
               price DECIMAL(10, 2) NOT NULL,
               storeName VARCHAR(255) NOT NULL,
               description TEXT NOT NULL,
               image_path VARCHAR(255) DEFAULT NULL,
               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
     `);

     const query = `
          SELECT
               o.id AS id,
               o.status AS status,
               o.createdAt AS createdAt,
               o.productId AS productId,
               COALESCE(a.title, 'Product unavailable') AS name,
               COALESCE(a.price, 0) AS price,
               COALESCE(a.storeName, 'Vendor') AS store,
               COALESCE(a.image_path, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80') AS image
          FROM orders o
          LEFT JOIN userads a ON a.productId = o.productId
          WHERE o.userId = ?
          ORDER BY o.createdAt DESC
     `;

     const [rows] = await db.execute(query, [userId]);

     return rows.map((row) => ({
          id: row.id,
          productId: row.productId,
          productName: row.name,
          store: row.store,
          price: Number(row.price),
          qty: 1,
          status: row.status,
          date: row.createdAt,
          image: row.image
     }));
};

const ensureCommentsTable = async () => {
     await db.execute(`
          CREATE TABLE IF NOT EXISTS comments (
               id INT AUTO_INCREMENT PRIMARY KEY,
               userId INT NOT NULL,
               productId INT NOT NULL,
               comment TEXT NOT NULL,
               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
     `);
};

const AddComment = async (req) => {
     const { productId, comment } = req.body;
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!productId) {
          throw new Error("Product id is required to post a comment.");
     }

     if (!comment || !comment.trim()) {
          throw new Error("Comment text is required.");
     }

     if (!userId) {
          throw new Error("User authentication is required to post a comment.");
     }

     await ensureCommentsTable();

     const [result] = await db.execute(
          "INSERT INTO comments (userId, productId, comment) VALUES (?, ?, ?)",
          [userId, productId, comment.trim()]
     );

     const [rows] = await db.execute(
          `SELECT c.id AS id, c.comment AS comment, c.createdAt AS createdAt, u.name AS name, u.email AS email
           FROM comments c
           LEFT JOIN users u ON u.userid = c.userId
           WHERE c.id = ?`,
          [result.insertId]
     );

     return rows[0];
};

const GetProductComments = async (req) => {
     const productId = req.query?.productId || req.body?.productId;

     if (!productId) {
          throw new Error("Product id is required to fetch comments.");
     }

     await ensureCommentsTable();

     const [rows] = await db.execute(
          `SELECT c.id AS id, c.comment AS comment, c.createdAt AS createdAt, u.name AS name, u.email AS email
           FROM comments c
           LEFT JOIN users u ON u.userid = c.userId
           WHERE c.productId = ?
           ORDER BY c.createdAt DESC`,
          [productId]
     );

     return rows;
};

const GetVendorAds = async (vendorId) => {
     if (!vendorId) {
          throw new Error("Vendor id is required.");
     }

     await ensureUseradsTable();

     const [userRows] = await db.execute(
          "SELECT name, storeName FROM users WHERE userid = ?",
          [vendorId]
     );

     if (userRows.length === 0) {
          throw new Error("Vendor not found.");
     }

     const [adRows] = await db.execute(
          "SELECT productId AS id, title AS name, price, storeName, description, image_path AS image, createdAt FROM userads WHERE userId = ? AND status = 'approved' ORDER BY createdAt DESC",
          [vendorId]
     );

     return {
          vendorName: userRows[0].name,
          storeName: userRows[0].storeName || "Marketo Store",
          ads: adRows.map((row) => ({
               id: row.id,
               name: row.name,
               price: Number(row.price),
               status: "active",
               views: 0,
               image: row.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
               storeName: row.storeName,
               description: row.description,
               createdAt: row.createdAt
          }))
     };
};

const ensureReportsTable = async () => {
     await db.execute(`
          CREATE TABLE IF NOT EXISTS reports (
               id INT AUTO_INCREMENT PRIMARY KEY,
               userId INT NOT NULL,
               storeName VARCHAR(255) NOT NULL,
               comment TEXT NOT NULL,
               status VARCHAR(50) NOT NULL DEFAULT 'open',
               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
     `);

     const [columns] = await db.execute("SHOW COLUMNS FROM reports");
     const columnNames = columns.map((column) => column.Field);

     if (!columnNames.includes('status')) {
          await db.execute("ALTER TABLE reports ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'open'");
     }
};

const assertAdmin = async (req) => {
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!userId) {
          throw new Error("User authentication is required.");
     }

     const [rows] = await db.execute("SELECT role FROM users WHERE userid = ?", [userId]);

     if (rows.length === 0 || rows[0].role !== 'admin') {
          throw new Error("Admin access is required for this action.");
     }

     return userId;
};

const sendStoreDeletedEmail = async (email, name) => {
     const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
               user: 'ameenaamir121@gmail.com',
               pass: 'aryu czss gzrh ybaf'
          }
     });

     await transporter.sendMail({
          from: 'ameenaamir121@gmail.com',
          to: email,
          subject: 'Your Marketo store has been removed',
          text: `Hello ${name || ''},\n\nYour store and account on Marketo have been removed by an administrator due to a policy violation.\n\nIf you believe this was a mistake, please contact support.\n\n- Marketo Team`
     });
};

const GetAllVendorStores = async (req) => {
     await assertAdmin(req);

     const [rows] = await db.execute(`
          SELECT
               u.userid AS vendorId,
               u.name AS vendorName,
               u.email AS email,
               u.storeName AS storeName,
               COUNT(a.productId) AS productCount,
               MIN(a.createdAt) AS joinedAt
          FROM users u
          JOIN userads a ON a.userId = u.userid
          GROUP BY u.userid, u.name, u.email, u.storeName
          ORDER BY joinedAt DESC
     `);

     return rows.map((row) => ({
          vendorId: row.vendorId,
          vendorName: row.vendorName,
          email: row.email,
          storeName: row.storeName || `${row.vendorName}'s Store`,
          productCount: Number(row.productCount),
          joinedAt: row.joinedAt
     }));
};

const BanStore = async (req) => {
     await assertAdmin(req);

     const { vendorId } = req.body;

     if (!vendorId) {
          throw new Error("Vendor id is required to ban a store.");
     }

     const [userRows] = await db.execute("SELECT name, email FROM users WHERE userid = ?", [vendorId]);

     if (userRows.length === 0) {
          throw new Error("Vendor not found.");
     }

     const { name, email } = userRows[0];

     await db.execute("DELETE FROM cart WHERE userId = ?", [vendorId]);
     await db.execute("DELETE FROM userads WHERE userId = ?", [vendorId]);
     await db.execute("DELETE FROM users WHERE userid = ?", [vendorId]);

     if (email) {
          try {
               await sendStoreDeletedEmail(email, name);
          } catch (emailError) {
               console.warn('Failed to send store-deleted email:', emailError.message);
          }
     }

     return { success: true, vendorId };
};

const GetAdminReports = async (req) => {
     await assertAdmin(req);
     await ensureReportsTable();

     const [rows] = await db.execute(`
          SELECT r.id AS id, r.storeName AS storeName, r.comment AS comment, r.status AS status, r.createdAt AS createdAt, u.email AS reporterEmail
          FROM reports r
          LEFT JOIN users u ON u.userid = r.userId
          ORDER BY r.createdAt DESC
     `);

     return rows;
};

const ResolveReport = async (req) => {
     await assertAdmin(req);

     const { reportId } = req.body;

     if (!reportId) {
          throw new Error("Report id is required.");
     }

     await ensureReportsTable();
     await db.execute("UPDATE reports SET status = 'resolved' WHERE id = ?", [reportId]);

     return { success: true, reportId };
};

const SubmitReport = async (req) => {
     const { storeName, comment } = req.body;
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!storeName) {
          throw new Error("Store name is required to submit a report.");
     }

     if (!comment || !comment.trim()) {
          throw new Error("Report comment is required.");
     }

     if (!userId) {
          throw new Error("User authentication is required to submit a report.");
     }

     await ensureReportsTable();

     const [result] = await db.execute(
          "INSERT INTO reports (userId, storeName, comment) VALUES (?, ?, ?)",
          [userId, storeName, comment.trim()]
     );

     return {
          success: true,
          id: result.insertId,
          userId,
          storeName
     };
};

const GetUserRole = async (req) => {
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!userId) {
          throw new Error("User authentication is required to check role.");
     }

     const [rows] = await db.execute("SELECT role FROM users WHERE userid = ?", [userId]);

     if (rows.length === 0) {
          throw new Error("User not found.");
     }

     return { role: rows[0].role || "vendor" };
};

const GetVendorOrders = async (req) => {
     const vendorId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!vendorId) {
          throw new Error("User authentication is required to fetch vendor orders.");
     }

     await ensureOrdersTable();

     const [rows] = await db.execute(
          `SELECT o.id AS id, o.status AS status, o.createdAt AS createdAt, o.productId AS productId,
                a.title AS productName, a.price AS price,
                u.name AS buyerName, u.email AS buyerEmail
           FROM orders o
           JOIN userads a ON a.productId = o.productId
           JOIN users u ON u.userid = o.userId
           WHERE a.userId = ?
           ORDER BY o.createdAt DESC`,
          [vendorId]
     );

     return rows.map((row) => ({
          id: row.id,
          productId: row.productId,
          productName: row.productName,
          price: Number(row.price),
          status: row.status,
          date: row.createdAt,
          buyerName: row.buyerName,
          buyerEmail: row.buyerEmail
     }));
};

const MarkOrderReadyToShip = async (req) => {
     const vendorId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);
     const { orderId } = req.body;

     if (!vendorId) {
          throw new Error("User authentication is required.");
     }

     if (!orderId) {
          throw new Error("Order id is required.");
     }

     const [result] = await db.execute(
          `UPDATE orders o
           JOIN userads a ON a.productId = o.productId
           SET o.status = 'ready_to_ship'
           WHERE o.id = ? AND a.userId = ?`,
          [orderId, vendorId]
     );

     if (result.affectedRows === 0) {
          throw new Error("Order not found or you are not allowed to update it.");
     }

     return { success: true, orderId };
};

const RequestPasswordReset = async (req) => {
     const { email } = req.body;

     if (!email) {
          throw new Error("Email is required.");
     }

     const [rows] = await db.execute("SELECT userid FROM users WHERE email = ?", [email]);

     if (rows.length === 0) {
          throw new Error("No account found with this email.");
     }

     return { success: true };
};

const ResetPassword = async (req) => {
     const { email, otp, newPassword } = req.body;

     if (!email || !otp || !newPassword) {
          throw new Error("Email, OTP and new password are required.");
     }

     const [rows] = await db.execute("SELECT otp, createdAt FROM otp WHERE email = ?", [email]);

     if (rows.length === 0) {
          throw new Error("OTP not found. Please request a new one.");
     }

     const stored = String(rows[0].otp).trim();
     const entered = String(otp).trim();

     if (stored !== entered) {
          throw new Error("Invalid OTP.");
     }

     const diffMinutes = (new Date() - new Date(rows[0].createdAt)) / 1000 / 60;

     if (diffMinutes > 10) {
          await db.execute("DELETE FROM otp WHERE email = ?", [email]);
          throw new Error("OTP expired. Please request a new one.");
     }

     await db.execute("UPDATE users SET password = ? WHERE email = ?", [newPassword, email]);
     await db.execute("DELETE FROM otp WHERE email = ?", [email]);

     return { success: true };
};

const EditAdByUserId = async (req) => {
     const { adId, id, productId, title, price, storeName, description, userId: bodyUserId } = req.body;
     const imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body?.image || null);

     const resolvedAdId = adId || id || productId || null;

     let userId = req.user?.id || req.user?.userId || req.user?.user_id || req.user?.userid || bodyUserId || req.body?.userId || req.body?.user_id || req.body?.userid || null;

     if (!userId) {
          const authHeader = req.headers?.authorization || req.headers?.Authorization || req.get?.('authorization') || req.get?.('Authorization');
          if (authHeader && authHeader.startsWith('Bearer ')) {
               const token = authHeader.split(' ')[1];
               const secret = process.env.JWT_SECRET || 'replace_this_with_real_secret';
               try {
                    const decoded = jwt.verify(token, secret);
                    userId = decoded?.id || decoded?.userId || decoded?.user_id || decoded?.userid || null;
               } catch (tokenError) {
                    console.warn('JWT verification failed in edit-ad:', tokenError.message);
               }
          }
     }

     if (!resolvedAdId) {
          throw new Error("Ad id is required to edit the listing.");
     }

     if (!userId) {
          throw new Error("User authentication is required to edit the ad.");
     }

     const updates = [];
     const values = [];

     if (title !== undefined && title !== null && title !== '') {
          updates.push('title = ?');
          values.push(title);
     }

     if (price !== undefined && price !== null && price !== '') {
          updates.push('price = ?');
          values.push(Number(price));
     }

     if (storeName !== undefined && storeName !== null && storeName !== '') {
          updates.push('storeName = ?');
          values.push(storeName);
     }

     if (description !== undefined && description !== null && description !== '') {
          updates.push('description = ?');
          values.push(description);
     }

     if (imagePath) {
          updates.push('image_path = ?');
          values.push(imagePath);
     }

     if (updates.length === 0) {
          throw new Error("No changes were provided.");
     }

     values.push(userId, resolvedAdId);
     const query = `UPDATE userads SET ${updates.join(', ')} WHERE userId = ? AND productId = ?`;
     const [result] = await db.execute(query, values);

     if (result.affectedRows === 0) {
          throw new Error("Ad not found or you are not allowed to edit it.");
     }

     return {
          success: true,
          id: resolvedAdId,
          userid: userId,
          title: title ?? null,
          price: price !== undefined ? Number(price) : null,
          storeName: storeName ?? null,
          description: description ?? null,
          image: imagePath ?? null
     };
}

const ensureUseradsTable = async () => {
     await db.execute(`
          CREATE TABLE IF NOT EXISTS userads (
               productId INT AUTO_INCREMENT PRIMARY KEY,
               userId INT NOT NULL,
               title VARCHAR(255) NOT NULL,
               price DECIMAL(10, 2) NOT NULL,
               storeName VARCHAR(255) NOT NULL,
               description TEXT NOT NULL,
               image_path VARCHAR(255) DEFAULT NULL,
               status VARCHAR(20) NOT NULL DEFAULT 'approved',
               createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
     `);

     const [columns] = await db.execute("SHOW COLUMNS FROM userads");
     const columnNames = columns.map((column) => column.Field);

     if (!columnNames.includes('status')) {
          await db.execute("ALTER TABLE userads ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved'");
     }
};

const GetAllAds = async () => {
     await ensureUseradsTable();

     const query = "SELECT productId AS id, userId, title AS name, price, storeName, description, image_path AS image, status AS approvalStatus, createdAt FROM userads WHERE status = 'approved' ORDER BY createdAt DESC";
     const [rows] = await db.execute(query);

     return rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          status: "active",
          approvalStatus: row.approvalStatus,
          views: 0,
          image: row.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
          storeName: row.storeName,
          description: row.description,
          createdAt: row.createdAt,
          userId: row.userId
     }));
}

const GetAdsByUserId = async (req) => {
     const userId = req.user?.id || req.user?.userId || req.user?.user_id || req.user?.userid || req.body?.userId || req.body?.user_id || req.body?.userid || null;

     if (!userId) {
          throw new Error("User authentication is required to fetch ads.");
     }

     await ensureUseradsTable();

     const query = "SELECT productId AS id, userId, title AS name, price, storeName, description, image_path AS image, status AS approvalStatus, createdAt FROM userads WHERE userId = ? ORDER BY createdAt DESC";
     const [rows] = await db.execute(query, [userId]);

     return rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          status: "active",
          approvalStatus: row.approvalStatus,
          views: 0,
          image: row.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
          storeName: row.storeName,
          description: row.description,
          createdAt: row.createdAt
     }));
}

const GetPendingAds = async (req) => {
     await assertAdmin(req);
     await ensureUseradsTable();

     const [rows] = await db.execute(`
          SELECT a.productId AS id, a.title AS name, a.price, a.storeName, a.description, a.image_path AS image, a.createdAt AS createdAt,
                 u.userid AS vendorId, u.name AS vendorName, u.email AS vendorEmail
          FROM userads a
          JOIN users u ON u.userid = a.userId
          WHERE a.status = 'pending'
          ORDER BY a.createdAt ASC
     `);

     return rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          storeName: row.storeName,
          description: row.description,
          image: row.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
          createdAt: row.createdAt,
          vendorId: row.vendorId,
          vendorName: row.vendorName,
          vendorEmail: row.vendorEmail
     }));
};

const ApproveAd = async (req) => {
     await assertAdmin(req);
     const { productId } = req.body;

     if (!productId) {
          throw new Error("Product id is required.");
     }

     const [result] = await db.execute("UPDATE userads SET status = 'approved' WHERE productId = ?", [productId]);

     if (result.affectedRows === 0) {
          throw new Error("Ad not found.");
     }

     return { success: true, productId };
};

const RejectAd = async (req) => {
     await assertAdmin(req);
     const { productId } = req.body;

     if (!productId) {
          throw new Error("Product id is required.");
     }

     const [result] = await db.execute("UPDATE userads SET status = 'rejected' WHERE productId = ?", [productId]);

     if (result.affectedRows === 0) {
          throw new Error("Ad not found.");
     }

     return { success: true, productId };
};

const PostAd = async (req) => {
     const { title, price, storeName, description, userId: bodyUserId } = req.body;
     const imagePath = req.file ? `/uploads/${req.file.filename}` : (req.body?.image || null);

     let userId = req.user?.id || req.user?.userId || req.user?.user_id || req.user?.userid || bodyUserId || req.body?.userId || req.body?.user_id || req.body?.userid || null;

     if (!userId) {
          const authHeader = req.headers?.authorization || req.headers?.Authorization || req.get?.('authorization') || req.get?.('Authorization');
          if (authHeader && authHeader.startsWith('Bearer ')) {
               const token = authHeader.split(' ')[1];
               const secret = process.env.JWT_SECRET || 'replace_this_with_real_secret';
               try {
                    const decoded = jwt.verify(token, secret);
                    userId = decoded?.id || decoded?.userId || decoded?.user_id || decoded?.userid || null;
               } catch (tokenError) {
                    console.warn('JWT verification failed in post-ad:', tokenError.message);
               }
          }
     }

     if (!userId) {
          throw new Error("User authentication is required to post an ad.");
     }

     if (!title || !price || !storeName || !description) {
          throw new Error("Title, price, store name and description are required.");
     }

     try {
          await db.execute(`
               CREATE TABLE IF NOT EXISTS userads (
                    productId INT AUTO_INCREMENT PRIMARY KEY,
                    userId INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    storeName VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    image_path VARCHAR(255) DEFAULT NULL,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
               )
          `);

          const [columns] = await db.execute("SHOW COLUMNS FROM userads");
          const columnNames = columns.map((column) => column.Field);

          if (columnNames.includes('userid') && !columnNames.includes('userId')) {
               await db.execute("ALTER TABLE userads CHANGE userid userId INT NOT NULL");
          }

          if (columnNames.includes('image') && !columnNames.includes('image_path')) {
               await db.execute("ALTER TABLE userads CHANGE image image_path VARCHAR(255) DEFAULT NULL");
          }

          if (columnNames.includes('created_at') && !columnNames.includes('createdAt')) {
               await db.execute("ALTER TABLE userads CHANGE created_at createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
          }

          if (!columnNames.includes('storeName')) {
               await db.execute("ALTER TABLE userads ADD COLUMN storeName VARCHAR(255) NOT NULL DEFAULT ''");
          }

          if (!columnNames.includes('description')) {
               await db.execute("ALTER TABLE userads ADD COLUMN description TEXT NOT NULL");
          }

          if (!columnNames.includes('image_path')) {
               await db.execute("ALTER TABLE userads ADD COLUMN image_path VARCHAR(255) DEFAULT NULL");
          }

          if (!columnNames.includes('status')) {
               await db.execute("ALTER TABLE userads ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved'");
          }
     } catch (schemaError) {
          console.warn("Ad table schema check warning:", schemaError.message);
     }

     const query = "INSERT INTO userads (userId, title, price, storeName, description, image_path, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')";
     const [result] = await db.execute(query, [userId, title, price, storeName, description, imagePath]);

     return {
          success: true,
          id: result.insertId,
          userid: userId,
          title,
          price,
          storeName,
          description,
          image: imagePath,
          status: "pending"
     };
}

const GetUserReports = async (req) => {
     const userId = getResolvedUserId(req, req.body?.userId || req.body?.user_id || req.body?.userid || null);

     if (!userId) {
          throw new Error("User authentication is required to fetch your reports.");
     }

     await ensureReportsTable();

     const [rows] = await db.execute(
          `SELECT id, storeName, comment, status, createdAt
           FROM reports
           WHERE userId = ?
           ORDER BY createdAt DESC`,
          [userId]
     );

     return rows;
};

module.exports = { RegisterUser, GetUserByEmail, UpdateUserStoreName, DeleteAdByUserId, EditAdByUserId, GetAllAds, GetAdsByUserId, PostAd, AddToCart, RemoveFromCart, GetUserCart, PlaceOrder, GetUserOrders, AddComment, GetProductComments, GetVendorAds, SubmitReport, GetUserRole, GetAllVendorStores, BanStore, GetAdminReports, ResolveReport, GetVendorOrders, MarkOrderReadyToShip, RequestPasswordReset, ResetPassword, GetPendingAds, ApproveAd, RejectAd, GetUserReports };