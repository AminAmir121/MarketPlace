const db = require('../utils/db'); // your existing DB connection
const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

// Helper function to generate 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // returns 4-digit string
}


async function sendOTPEmail(email, otp) {
    await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: 'Marketo', email: 'ameenaamir121@gmail.com' },
        to: [{ email }],
        subject: `Your OTP is ${otp}`,
        textContent: `Hello! Your OTP is: ${otp}. It will expire in 10 minutes.`
    });
}

// Main function to generate and send OTP
async function generateAndSendOTP(email) {
    try {
        // Generate OTP
        const otp = generateOTP();

        // Insert into OTP table
        await db.execute(
            'INSERT INTO otp (email, otp) VALUES (?, ?) ON DUPLICATE KEY UPDATE otp = ?, createdAt = CURRENT_TIMESTAMP',
            [email, otp, otp]
        );

        // Send OTP email
        await sendOTPEmail(email, otp);

        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Error generating/sending OTP:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
}


async function verifyOTP(req, res) {

    const { email, enteredOtp } = req.body;

    try {
        const [rows] = await db.execute(
            'SELECT otp, createdAt FROM otp WHERE email = ?',
            [email && email.trim()]
        );


        if (rows.length === 0) {
            return res.json({ success: false, message: 'OTP not found' });
        }

        const otpData = rows[0];

        // Normalize stored and entered OTP to strings to avoid type mismatch
        const stored = String(otpData.otp).trim();
        const entered = String(enteredOtp).trim();

        console.log('Verifying OTP for', email, { stored, entered, storedType: typeof otpData.otp, enteredType: typeof enteredOtp });

        if (stored !== entered) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        const now = new Date();
        const createdAt = new Date(otpData.createdAt);
        const diffMinutes = (now - createdAt) / 1000 / 60;

        if (diffMinutes > 10) {
            await db.execute('DELETE FROM otp WHERE email = ?', [email]);
            return res.json({ success: false, message: 'OTP expired' });
        }

        await db.execute('DELETE FROM otp WHERE email = ?', [email]);

        return res.json({ success: true, message: 'OTP verified successfully' });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { generateAndSendOTP, verifyOTP };
