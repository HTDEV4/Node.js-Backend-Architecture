"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  // * v1
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // lv 0
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });

      // return tokens ? tokens.publicKey : null;

      // level xxx
      // Tìm key của user này.
      const filter = { user: userId };

      // Dữ liệu mới để cập nhật (hoặc tạo nếu chưa có).
      const update = {
        publicKey,
        privateKey,
        refreshTokenUsed: [], // Dùng để theo dõi các refresh token đã sử dụng.
        refreshToken,
      };

      // Tùy chọn cho câu lệnh.
      const options = {
        upsert: true, // Nếu không tìm thấy thì tạo mới.
        new: true, // Trả về document sau khi đã cập nhật (thay vì bản gốc).
      };

      // Thực hiện tìm và cập nhật/tạo mới theo kĩ thuật (atomic).
      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.error(`Error in createKeyToken:`, error);
      throw error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: userId }).lean();
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne(id);
  };
}

module.exports = KeyTokenService;
