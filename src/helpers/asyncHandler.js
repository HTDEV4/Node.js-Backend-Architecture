/**
 * Hàm tiện ích (wrapper) để tự động bắt lỗi trong các route handler bất đồng bộ.
 * Nó giúp loại bỏ sự cần thiết của khối try...catch trong mỗi controller.
 * @param {Function} fn - Hàm controller bất đồng bộ (async function).
 * @returns {Function} - Một hàm mới có chức năng bắt lỗi tự động.
 */
const asyncHandler = (fn) => {
  // Trả về một hàm mới, đây chính là hàm mà Express sẽ gọi.
  // Hàm này có cùng signature với một Express route handler.
  return (req, res, next) => {
    // Thực thi hàm controller gốc (fn).
    // Vì fn là một hàm async, nó sẽ trả về một Promise.
    // Chúng ta gắn phương thức .catch() vào Promise này.
    // Nếu Promise bị reject (có lỗi), .catch() sẽ được gọi.
    // Lỗi sẽ được tự động truyền vào hàm `next`,
    // đưa luồng xử lý đến error-handling middleware của Express.
    fn(req, res, next).catch(next);

    // Dòng trên là cách viết tắt của:
    // fn(req, res, next).catch(error => next(error));
  };
};

module.exports = {
  asyncHandler,
};
