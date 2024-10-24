import { User, Customer, Staff } from '../models/user.schema.js';
import bcrypt from 'bcrypt'
import UnauthorizedError from '../errors/unauthorizedError.js'
import BadRequestError from '../errors/badRequestError.js'
import ForbiddenError from '../errors/forbiddenError.js';
import jwtServices from '../utils/jwtServices.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import NotFoundError from '../errors/badRequestError.js';
import crypto from 'crypto'

dotenv.config()

// Login by email and password
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw new BadRequestError('Invalid request body.');
    }

    const user = await User.findOne({ email: email }).lean();
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
      maxAge: 1000 * 60 * 30, // 30m
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
    });

    res.status(200).send();

  } catch (error) {
    next(error)
  };
};

export const signUp = async (req, res, next) => {
  try {
    const { role, password, ...userData } = req.body;

    // Check if password is strong enough (at least 6 character, 1 Upcase letter, 1 Number and 1 Lowercase letter)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestError("Password is not strong is enough. Must have at least at least 6 characters and contains at least 1 Upcase letter, 1 Number and 1 Lowercase letter");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    userData.password = hashedPassword;

    // Prevent user set some fields that are not allowed
    userData.status = true;
    userData.refreshToken = null;
    userData.isVerified = false;
    userData.resetPasswordToken = null;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    sendVerifyEmail(userData.email, userData.fullName, baseUrl);

    const newUser = role === 'Customer' ? new Customer(userData) : new Staff(userData);

    await newUser.save();
    res.status(201).send();
  } catch (error) {
    next(error);
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = jwtServices.verifyToken(token);
    if (payload.token_type != 'verify_token') {
      throw new UnauthorizedError('Invalid token type');
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

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    sendResetPasswordEmail(user.email, user.fullName, token, baseUrl)

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
    const user = await User.findOne({ 'resetPasswordToken.token': token })

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

const sendVerifyEmail = (receiverEmail, name, baseUrl) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_PASS,
    }
  });

  const verificationToken = jwtServices.generateVerificationToken({
    email: receiverEmail
  });

  const verificationLink = `${baseUrl}/api/auth/verify?token=${verificationToken}`;

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

  transporter.sendMail(mailOptions, function (error, _) {
    if (error) {
      throw error;
    }
  });
}

const sendResetPasswordEmail = (receiverEmail, name, token, baseUrl) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_PASS,
    }
  });


  const verificationLink = `${baseUrl}/api/auth/password-reset?token=${token}`;

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

  transporter.sendMail(mailOptions, function (error, _) {
    if (error) {
      throw error;
    }
  });
}

