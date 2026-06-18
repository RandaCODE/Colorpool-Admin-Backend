const admin = require('firebase-admin');

module.exports = async (req, res, next) => {
    // Ensure Firebase is initialized
    if (admin.apps.length === 0) {
        return res.status(500).json({ msg: 'Firebase Admin SDK not initialized' });
    }

    let token;
    const authHeader = req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else {
        token = req.header('x-auth-token');
    }

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Fetch role from Firestore
        const db = admin.firestore();
        const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();

        if (!adminDoc.exists) {
            return res.status(403).json({ msg: 'User is not an authorized admin' });
        }

        const adminData = adminDoc.data();
        if (!adminData.active) {
            return res.status(403).json({ msg: 'Admin account is inactive' });
        }

        req.admin = {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: adminData.role
        };

        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
