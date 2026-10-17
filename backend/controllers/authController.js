import User from "../model/User.js";
import Employee from "../model/Employee.js";
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from "../config/brevo.js";
import jwt from 'jsonwebtoken'

//to sign. up an admin

export const signupAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
     
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            message: "Admin already exists"
        })
    }
    //to hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    ///to generate 6 digit otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000)  //15 mins

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        isVerified: false,
        verificationOtp: otp,
        verificationOtpExpires: otpExpires
    })

    //to send email that contains  the otp
    sendOtpEmail(email, otp, name).catch(err => console.error("Error sending admin verification OTP email:", err ))
    .res.status(201).json({
        message: "Admin already registered successfully. pls verify your email.",
        email: user.email

    })
  }
   catch (err) {
    console.log("SignUp Error:", err);
    res.status(500).json({
        message: "Server Error"
    })
   }
};

//to login 

export const login = async (res, req) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if( !user ){
            return res.status(400).json({
                message: "Invalid Email"
            })
        }

        if(!user.isVerified) {
            return res.status(400).json({
                message: "Your account is not verified. please verify your email",
                sVerified: false,
                email: user.email
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status (400).json({
                message: "Invalid Credentials"
            });


        }
    } catch (error) {
        
    }
}
