
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
  
const sendResetEmail = (userEmail) => {
    // Send an email containing the reset link with the token
    // You can use nodemailer or any other email sending library
    // Include the reset token in the link, e.g., /reset-password?token=yourTokenHere
    console.log(`Sending reset email to ${userEmail}`);
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
        to: userEmail,
        subject: 'reset your password',
        text: 'Click the following link to reset your password: ',
        html:`<a href="http://localhost:3000/resetpassword?email=${userEmail}">Reset Password</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
  };

  const requestPasswordReset = asyncHandler(async (req, res) => {
    try {
            const userEmail = req.body.email;
            const user = await User.findOne({ email: userEmail });
        
            if (user) {
              
                // Send the reset email
                sendResetEmail(userEmail);
                console.log("email sent successfully")
                res.status(200).json({ success : true, message: 'A reset password email has been sent. Please check your email inbox.' });

            } else {
                res.status(401).json({ message: "Email is not valid" });
            }
    } catch (error) {
        console.error('Error resetting password:', error);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token has expired' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

export { requestPasswordReset };

  //==================================reset the password=================================================================

const resetPassword = async (req, res) => {
    try {
        const { email, password, verifyPassword } = req.body;
        console.log('Email:', email); // Log the email to check if it's correctly passed
        
        // // Access the user ID from the decoded information attached by the middleware
        // const {email} = req.query;

        // Find the user based on the user ID
        const user = await User.findOne({ email: email });
        // Find the auth based on the user ID
        const auth = await Author.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if newPassword and confirmPassword match
        if (password !== verifyPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password in the database
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    access_token: null, // Clear the reset token after successful reset
                },
            }
        );

        // Update the author's password in the database
        await Author.updateOne(
            { email: auth.email },
            {
                $set: {
                    password: hashedPassword,
                },
            }
        );

        res.status(200).json({ success : true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token has expired' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

export { resetPassword };