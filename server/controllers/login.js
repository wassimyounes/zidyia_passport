
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';

import jwt from 'jsonwebtoken';

// Array of admin emails
const adminEmails = ['ohamzeh10@gmail.com','marabohaidar@gmail.com', 'wass.younes@gmail.com'];


// login user
const loginuser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const auth = await Author.findOne({ email });

    // Check if the user exists
    if (auth && (await bcrypt.compare(password, auth.password) && auth.verifyStatus === true)) {

        // Check if the user is an admin based on the email
        const isAdmin = adminEmails.includes(email);

        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email });

        // If the user already exists, update the access token and role
        if (existingUser) {
            existingUser.access_token = jwt.sign({
                user: {
                    first_name: auth.first_name,
                    last_name: auth.last_name,
                    email: auth.email,
                    id: existingUser.id,
                    role: isAdmin ? 'admin' : 'user', // Set the role based on isAdmin
                }
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3m" });
            //refresh token
            const refreshToken = jwt.sign({
                user: {
                    first_name: auth.first_name,
                    last_name: auth.last_name,
                    email: auth.email,
                    id: existingUser.id,
                    role: isAdmin ? 'admin' : 'user',
                }
            }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

            // Save the refresh token in a secure manner (e.g., database, secure cookie)
            existingUser.refresh_token = refreshToken;

            // Save the refresh token in a secure cookie
            res.cookie('accessToken', existingUser.access_token, { httpOnly: true, secure: true});
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days in milliseconds

            await existingUser.save();

            res.status(200).json({
                user: existingUser, // Send either existing user or new user data
                success: true,
                message: "Login successful!"
              });
        } else {
            // If the user does not exist, create a new user entry
        const newUser = await User.create({
            first_name: auth.first_name,
            last_name: auth.last_name,
            email: auth.email,
            password: auth.password, // You may want to consider hashing the password again
            role: isAdmin ? 'admin' : 'user',
        });

        // Generate access token and refresh token for the new user
        const accessToken = jwt.sign({
            user: {
                first_name: auth.first_name,
                last_name: auth.last_name,
                email: auth.email,
                id: newUser.id,
                role: newUser.role,
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3m" });

        const refreshToken = jwt.sign({
            user: {
                first_name: auth.first_name,
                last_name: auth.last_name,
                email: auth.email,
                id: newUser.id,
                role: newUser.role,
            }
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

        // Save the refresh token in a secure cookie
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true});
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days in milliseconds

        res.status(200).json({
            user: newUser, // Send either existing user or new user data
            success: true,
            message: "Login successful!"
          });

        }
    } else {
        res.status(401);
        throw new Error("Email or password is not valid!");
    }
});

export { loginuser };





// =====================================================================================================================
