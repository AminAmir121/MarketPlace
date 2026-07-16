const db = require('../utils/db');
const jwt = require('jsonwebtoken');

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

const GetAllAds = async () => {
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

     const query = "SELECT productId AS id, userId, title AS name, price, storeName, description, image_path AS image, createdAt FROM userads ORDER BY createdAt DESC";
     const [rows] = await db.execute(query);

     return rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          status: "active",
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

     const query = "SELECT productId AS id, userId, title AS name, price, storeName, description, image_path AS image, createdAt FROM userads WHERE userId = ? ORDER BY createdAt DESC";
     const [rows] = await db.execute(query, [userId]);

     return rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          status: "active",
          views: 0,
          image: row.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
          storeName: row.storeName,
          description: row.description,
          createdAt: row.createdAt
     }));
}

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
     } catch (schemaError) {
          console.warn("Ad table schema check warning:", schemaError.message);
     }

     const query = "INSERT INTO userads (userId, title, price, storeName, description, image_path) VALUES (?, ?, ?, ?, ?, ?)";
     const [result] = await db.execute(query, [userId, title, price, storeName, description, imagePath]);

     return {
          success: true,
          id: result.insertId,
          userid: userId,
          title,
          price,
          storeName,
          description,
          image: imagePath
     };
}

module.exports = { RegisterUser, GetUserByEmail, UpdateUserStoreName, DeleteAdByUserId, EditAdByUserId, GetAllAds, GetAdsByUserId, PostAd, AddToCart, RemoveFromCart, GetUserCart };