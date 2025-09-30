"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  UnauthorizedError,
  ForbiddenError,
} = require("../core/error.response");

// * ====> Service
const { findByEmail } = require("./shop.service");

// RoleShop này phải đổi lại thành số để tránh bị lộ role
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /**
   *  check this token used
   * */
  static handlerRefreshToken = async (refreshToken) => {
    //* === Bước 1: Kiểm tra xem token này đã từng được sử dụng chưa ===
    //  Nếu một RT đã được sử dụng, có nghĩa là kẻ tấn công có thể đã lấy cắp nó.
    //  Đây là một cơ chế phát hiện rò rỉ token (Reuse Detection).
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    if (foundToken) {
      // decode xem mày là th nào có trong hệ thống của tao không
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      // xóa tất cả token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError(
        " A reused refresh token was detected! Please log in again. "
      );
    }

    // * === Bước 2: Kiểm tra xem refresh token có hợp lệ không ===
    //   Tìm keyStore đang chứa refresh token này.
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new UnauthorizedError("Invalid Refresh Token");

    // * === Bước 3: Xác thực token và thông tin người dùng ===
    //   Dùng privateKey được lưu trong DB để xác thực refreshToken.
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    // check UserId xem user có thật sự tồn tại trong DB không.
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new UnauthorizedError("User not registered");

    // * === Bước 4: Tạo cặp token mới (Refresh Token Rotation) ===
    //   Tạo một accessToken và một refreshToken hoàn toàn mới.
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // * === Bước 5: Cập nhật keyStore ===
    //   Cập nhật keyStore với refreshToken mới, và thêm refreshToken cũ vào danh sách đã sử dụng.
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken, // đã được sử dụng để lấy token mới rồi
      },
    });

    // * === Bước 6: Trả về cặp token mới cho người dùng ===
    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    // Thực hiện hành động xóa key token khỏi database
    await KeyTokenService.removeKeyById(keyStore._id);

    return {};
  };

  /*
    refeshToken: dùng để người dùng không cần đăng nhập lại tại nó đã được lưu trên cookie và phải nói với FE là nó vẫn được lưu trên cookie không cần truy cập db
    1. Check email in dbs
    2. Match password
    3. Create AccessToken & RefreshToken and save db
    4. Generate Token 
    5. Get data return login
  */
  static login = async ({ email, password, refreshToken = null }) => {
    // 1. Check email
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    // 2. Match password
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new UnauthorizedError("Authentication error");

    // 3. Create AccessToken & RefreshToken and save db
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4. Generate Token
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey
    );

    // 5. Get data return login
    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // step 1: check email exist
    // lean() nó sẽ giúp cho chúng ta trả về Object JS thuần túy chứ không phải là trả về Mongoose Document
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new ConflictRequestError("Error: Shop already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); // save collection KeyStore

      // * Save publicKey cho user
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Keystore error");
      }

      // * created token pair
      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );

      console.log(`Created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    } // End check new shop

    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
