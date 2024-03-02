
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';

import jwt from 'jsonwebtoken'; 
import nodemailer from 'nodemailer';
// ====================================================================================================================
// Function to send a verification email
function sendVerificationEmail(email, verificationToken) {
    const transporter = nodemailer.createTransport({
        // Set up your email transport configuration (e.g., SMTP, Gmail, etc.)
        // Example for using Gmail:
        service: 'gmail',
        auth: {
            user: 'globalimpactglobalimpact@gmail.com',
            pass: 'elqm kewq ajrr qhej',
        },
    });

    const mailOptions = {
        from: 'globalimpactglobalimpact@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        text: 'Click the following link to verify your email: ',
        html: `<a href="http://localhost:5000/author/registerverify?token=${verificationToken}">Verify email</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}




// ==============================================================================================================
// register user
const registeruser = asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    // Email validation using a regular expression
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Please enter a valid email address");
    }
    //check  email existance in database 
    const authorAvailable = await Author.findOne({ email });
    if (authorAvailable) {
        res.status(400);
        throw new Error("User already registered!")
    }
    // Additional password validation
    if (password.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        res.status(400);
        throw new Error("Password must be at least 6 characters long and contain both letters and numbers.");
    }
    // hash password
    const hashedpass = await bcrypt.hash(password, 10);
    console.log(`hasshed password: ${hashedpass}`)
    // Generate a verification token
    const verificationToken = jwt.sign({ email }, process.env.EMAIL_VERIFICATION_SECRET, { expiresIn: '1d' });

    const author = await Author.create({ first_name, last_name, email, password: hashedpass, verificationToken, });
    // Log the verification token and email message (for testing purposes)
    console.log(`Verification Token: ${verificationToken}`);
    console.log(`Email Message: Click the following link to verify your email: https://localhost:5000/verify?token=${verificationToken}`);

    // Send the verification email
    sendVerificationEmail(email, verificationToken);
    console.log(`user is created ${author}`)
    if (author) {
        res.status(201).json({ _id: author.id, email: author.email })
    } else {
        res.status(400);
        throw new Error("user data is not valid, can't create user")
    }
});
export { registeruser }
// ============================================================================================================

// Function to get a user by verification token
const getUserByVerificationToken = async (verificationToken) => {
    try {
        const user = await Author.findOne({ verificationToken });
        return user;
    } catch (error) {
        console.error('Error fetching user by verification token:', error);
        throw new Error('Error fetching user by verification token');
    }
};

const registerverification = asyncHandler(async (req, res) => {
    const userToken = req.query.token; // Get the token from the URL
    const user = await getUserByVerificationToken(userToken); // Retrieve user by token from the database

    if (user) {
        // Compare the token in the URL with the one stored in the database
        try {
            //jwt.verify(userToken, process.env.EMAIL_VERIFICATION_SECRET);

            // Perform your verification logic here
            // Update user status
            // Update verifyStatus to true
            await Author.findByIdAndUpdate(user._id, { verifyStatus: true });

            // Redirect the user to the login page after successful verification
            console.log('verification succeed');
            res.redirect('http://localhost:3000/login');
        } catch (error) {
            // Token verification failed, handle accordingly
            console.error('Error verifying token:', error);
            res.redirect('/author/register');
        }
    } else {
        // Invalid token or user not found, handle accordingly
        res.redirect('/author/register');
    }
});
export { registerverification };

