"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { UnauthorizedError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

// * ====> createTokenPair
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {}
};

/**
 * Middleware xác thực người dùng dựa trên Access Token.
 * Flow chuẩn:
 * 1. Lấy và kiểm tra định dạng 'Bearer <token>' từ header 'Authorization'.
 * 2. Dùng publicKey trong keyStore để xác thực accessToken.
 * 3. Nếu token hợp lệ, lấy userId từ payload của token.
 * 4. Dùng userId đáng tin cậy đó để tìm lại keyStore.
 * 5. So sánh, kiểm tra và gắn các thông tin cần thiết vào request.
 */
const authentication = asyncHandler(async (req, res, next) => {
  // === Lấy userId và accessToken từ header ===
  // KHÔNG dùng userId từ header để query DB nữa.

  // 1. Kiểm tra xem client có gửi đủ thông tin cần thiết không
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId)
    throw new UnauthorizedError("Invalid Request: Missing client ID");

  // 2. Tách token ra khỏi chuỗi "Bearer <token>"
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken)
    throw new UnauthorizedError("Invalid Request: Malformed token");

  // 3. Tìm keyStore DỰA VÀO userId mà client gửi lên.
  // Đây là bước cần thiết để có `publicKey` nhằm giải mã token.
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Keystore not found");

  // 4. Xác thực token
  try {
    // Dùng publicKey lấy từ DB để verify accessToken
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);

    // 5. So sánh userId từ payload của token và userId từ header
    // Đây là bước kiểm tra chéo quan trọng để đảm bảo client không giả mạo userId
    if (userId !== decodeUser.userId) {
      throw new UnauthorizedError("Invalid user credentials");
    }

    // 6. Gắn các thông tin đã được xác thực vào request để các hàm sau sử dụng
    req.keyStore = keyStore;
    req.user = decodeUser; // payload của token: { userId, email, ... }

    return next();
  } catch (error) {
    // Bắt các lỗi của JWT.verify (hết hạn, sai chữ ký...)
    // Ném lỗi gốc ra ngoài để error handler tổng xử lý
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
