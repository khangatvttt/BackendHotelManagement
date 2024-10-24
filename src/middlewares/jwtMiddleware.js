import UnauthorizedError from "../errors/unauthorizedError.js";
import { User } from "../models/user.schema.js";
import jwtServices from "../utils/jwtServices.js";

const jwtMiddleware = async (req, res, next) => {
  try {
    // Retrieve access and refresh tokens from cookies
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken) {
      throw new UnauthorizedError('No access token provided.');
    }

    try {
      const decodedAccessToken = jwtServices.verifyToken(accessToken);

      if (decodedAccessToken.token_type !== 'access_token') {
        throw new UnauthorizedError('Invalid access token.');
      }

      req.user = decodedAccessToken.user_id;
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Access token expired, attempt to refresh tokens
        return handleTokenRefresh(req, res, next, refreshToken);
      } else {
        throw new UnauthorizedError('Invalid access token.');
      }
    }
  } catch (err) {
    return next(err); 
  }
};

const handleTokenRefresh = async (req, res, next, refreshToken) => {
  try {
    if (!refreshToken) {
      throw new UnauthorizedError('Access token expired. No refresh token provided.');
    }

    const decodedRefreshToken = jwtServices.verifyToken(refreshToken);

    // Find user and validate the refresh token stored in DB
    const user = await User.findById(decodedRefreshToken.user_id).select('+refreshToken');;
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token. Please login again.');
    }

    // Generate new tokens
    const payload = { 
        user_id: user._id,
        email: user.email 
    };
    const newAccessToken = jwtServices.generateAccessToken(payload);
    const newRefreshToken = jwtServices.generateRefreshToken(refreshToken, payload);
    const expiredTime = jwtServices.verifyToken(newRefreshToken).exp;

    // Save new refresh token to the user document
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new tokens in cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 30, // 30m
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      expires: new Date(expiredTime * 1000), // Expiry from the decoded token
    });

    req.user = user._id; // Attach the user to the request
    next();
    
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Refresh token expired. Please login again.'));
    } else {
      return next(new UnauthorizedError('Invalid refresh token.'));
    }
  }
};

export default jwtMiddleware;

