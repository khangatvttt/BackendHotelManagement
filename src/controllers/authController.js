import { User, Customer, Staff, OnSiteCustomer, Admin } from '../models/user.schema.js';
import bcrypt from 'bcrypt'
import UnauthorizedError from '../errors/unauthorizedError.js'
import BadRequestError from '../errors/badRequestError.js'
import ForbiddenError from '../errors/forbiddenError.js';
import jwtServices from '../utils/jwtServices.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import NotFoundError from '../errors/badRequestError.js';
import crypto from 'crypto'
import { ROLES } from '../models/roles.js';
import { promisify } from 'util';


dotenv.config()

const BASE_FE_URL = "http://localhost:3001"

// Login by email and password
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw new BadRequestError('Invalid request body.');
    }

    const user = await User.findOne({ email: email }).select('+password').lean();
    // User with this email doesn't exist
    if (!user) {
      throw new UnauthorizedError("Email or password is incorrect");
    };

    // User is disbled
    if (!user.status) {
      throw new ForbiddenError("This user is disabled");
    };

    // Haven't activate email
    if (!user.isVerified) {
      throw new ForbiddenError("This account hasn't been verifed yet");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    // Password is not match
    if (!user || !validPassword) {
      throw new UnauthorizedError("Email or password is incorrect");
    };

    const payload = {
      user_id: user._id,
      role: user.role,
      email: user.email,
    }

    const accessToken = jwtServices.generateAccessToken(payload);
    const refreshToken = jwtServices.generateRefreshToken(null, payload);

    // Update refresh token of user with the new one
    await User.findOneAndUpdate(
      { email: email },
      { refreshToken: refreshToken },
    );

    // Set tokens in cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
    });

    res.status(200).send({
      user_id: user._id,
      role: user.role
    });

  } catch (error) {
    next(error)
  };
};

export const signUp = async (req, res, next) => {
  try {
    const { role, ...userData } = req.body;

    //Register with OnSite Customer role
    if (role == ROLES.ONSITE_CUSTOMER) {
      const { fullName, birthDate, gender, phoneNumber } = req.body;
      const userInfo = { fullName, birthDate, gender, phoneNumber };
      //Dummy data to bypass validator
      userInfo.email = `Dummy@dummy.com`;
      userInfo.password = 'DummyPassword1';

      const user = new OnSiteCustomer(userInfo);
      await user.save();
      // Remove email and password fields because OnSiteCustomer doesnt have those fields
      await User.updateOne({ phoneNumber: phoneNumber }, { $unset: { email: 1, password: 1 } }, { runValidators: false })
      res.status(201).send();
      return;
    }


    // Prevent user set some fields that are not allowed
    userData.status = true;
    userData.refreshToken = null;
    userData.isVerified = false;
    userData.resetPasswordToken = null;

    let newUser
    if (role == ROLES.STAFF || role == ROLES.ADMIN) {
      userData.status = false //New Staff and Admin account is disable until Admin turn it on
      role == ROLES.STAFF ? newUser = new Staff(userData) : newUser = new Admin(userData)
    }
    else {
      newUser = new Customer(userData);
    }

    await newUser.save();

    await sendVerifyEmail(userData.email, userData.fullName);

    res.status(201).send();
  } catch (error) {
    next(error);
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) {
      throw new BadRequestError('No token provided');
    }

    const payload = jwtServices.verifyToken(token);
    if (payload.token_type != 'verify_token') {
      throw new BadRequestError('Invalid token type');
    }

    const email = payload.email;
    const user = await User.findOne(
      { email: email },
    );

    if (user.isVerified == true) {
      throw new BadRequestError("This email is adready verified");
    }
    else {
      user.isVerified = true;
      await user.save()
    }

    res.status(200).send();
  }
  catch (error) {
    next(error);
  }
}

export const requestResetPassword = async (req, res, next) => {
  try {
    const email = req.body.email
    if (!email || typeof email !== 'string') {
      throw new BadRequestError('Invalid request body.');
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new NotFoundError(`User with email ${email} doesn't exist`);
    }

    if (!user.isVerified || !user.status) {
      throw new ForbiddenError('This account is disabled')
    }

    let token;
    let tokenExists = true
    while (tokenExists) {
      token = crypto.randomBytes(32).toString('hex');
      //Check duplicate token
      tokenExists = await User.findOne({ 'resetPasswordToken.token': token });
    }
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); //30m

    user.resetPasswordToken = {
      token,
      expires: expiresAt
    };

    sendResetPasswordEmail(user.email, user.fullName, token)

    await user.save();

    res.status(200).send()
  }
  catch (error) {
    next(error)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body
    const user = await User.findOne({ 'resetPasswordToken.token': token }).select('+resetPasswordToken +password');

    if (!user) {
      throw new BadRequestError("Invalid reset password token")
    }

    // Check if password is strong enough (at least 6 character, 1 Upcase letter, 1 Number and 1 Lowercase letter)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestError("Password is not strong is enough. Must have at least at least 6 characters and contains at least 1 Upcase letter, 1 Number and 1 Lowercase letter");
    }


    // Check expiration of token
    const currentTime = Date.now();
    const tokenExpires = user.resetPasswordToken.expires;
    if (currentTime > tokenExpires) {
      throw new BadRequestError("Reset password token expired")
    }

    //Hash new password and update for user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;

    //Remove reset password token
    user.resetPasswordToken = null

    await user.save()

    res.status(200).send()
  }
  catch (error) {
    next(error)
  }
}

export const logout = (req, res, next) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.status(200).send()
}

const sendVerifyEmail = async (receiverEmail, name) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_PASS,
    }
  });

  const sendMailAsync = promisify(transporter.sendMail.bind(transporter));


  const verificationToken = jwtServices.generateVerificationToken({
    email: receiverEmail
  });

  const verificationLink = `${BASE_FE_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: 'Hotel Zante Website <HotelZante@gmail.com>',
    to: receiverEmail,
    subject: 'Xác nhận email',
    html: `
      <p>Xin chào ${name},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản trên nền tảng của chúng tôi! Để hoàn tất quá trình đăng ký, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào liên kết dưới đây:</p>
      <p><a href="${verificationLink}">Xác Nhận Email</a></p>
      <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
      <p>Chúng tôi rất mong được chào đón bạn trên nền tảng của chúng tôi!</p>
      <p>Trân trọng,<br>Hotel Zante</p>
    `,
  };

  await sendMailAsync(mailOptions);

}

const sendResetPasswordEmail = async (receiverEmail, name, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_PASS,
    }
  });

  const sendMailAsync = promisify(transporter.sendMail.bind(transporter));

  const verificationLink = `${BASE_FE_URL}/forget-password?token=${token}`;

  const mailOptions = {
    from: 'Hotel Zante Website <HotelZante@gmail.com>',
    to: receiverEmail,
    subject: 'Reset mật khẩu',
    html: `
      <p>Xin chào ${name},</p>
      <p>Ai đó đã yêu cầu reset mật khẩu cho tài khoản Hotel Zante với email này. Nếu đó là bạn, hãy nhấn vào link bên dưới:</p>
      <p><a href="${verificationLink}">Reset mật khẩu</a></p>
      <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.</p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
      <p>Trân trọng,<br>Hotel Zante</p>
    `,
  };

  await sendMailAsync(mailOptions);

}

export const getCurrentUser = async (req, res, next) => {
    res.status(200).json({
      user_id: req.user.id,
      role: req.user.role
    });
}

