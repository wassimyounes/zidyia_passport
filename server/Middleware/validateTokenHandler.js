import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import {parse} from "cookie";
const validateToken = asyncHandler(async (req, res, next) => {

const cookies=req.headers.cookie;

const accessToken=parse(cookies).accessToken;
    if (accessToken) {
        // Extract the token from the Authorization header
        const token = accessToken;
        // Verify the token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // If the access token is expired, attempt to refresh it using the refresh token
                const refreshToken = req.cookies.refreshToken;

                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (refreshErr, refreshDecoded) => {
                    if (refreshErr) {
                        res.status(401).json({ message: "Invalid refresh token" });
                        res.clearCookie('refreshToken'); // Clear the refresh token cookie
                        res.redirect("localhost:3000/login"); // Redirect to login page
                    } else {
                        // Generate a new access token
                        const newAccessToken = jwt.sign({
                            user: {
                                id: refreshDecoded.user.id,
                                first_name: refreshDecoded.user.first_name,
                                last_name: refreshDecoded.user.last_name,
                                email: refreshDecoded.user.email,
                                role: refreshDecoded.user.role,
                            }
                        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3m" });

                        // Attach the user information to the request object
                        req.user = {
                            id: refreshDecoded.user.id,
                            first_name: refreshDecoded.user.first_name,
                            last_name: refreshDecoded.user.last_name,
                            email: refreshDecoded.user.email,
                            role: refreshDecoded.user.role,
                        };

                        // Set the new access token in the response headers
                        res.setHeader('Authorization', `Bearer ${newAccessToken}`);

                        next(); // Continue to the next middleware or route
                    }
                });
            } else {
                // Attach the user information to the request object
                req.user = decoded.user;
                next(); // Continue to the next middleware or route
            }
        });
    } else {
        res.status(401);
        throw new Error("User is not authorized or token is missing");
    }
});
// //Modified validateToken for admin authorization
const validateTokenForAdmin = asyncHandler(async (req, res, next) => {
    // Use the validateToken middleware to enforce authentication
    validateToken(req, res, async () => {
        // Access the user role from the decoded information
        const userRole = req.user.role;

        // Check if the user has admin permissions
        if (userRole !== 'admin') {
            res.status(403).json({ message: 'Admin permissions required' });
        } else {
            // User has admin permissions, proceed to the next middleware/route
            // redirect("localhost:3000/login")
            next();

        }
    });
});
export { validateToken,validateTokenForAdmin };