# Chú ý

- Không được động vào file server.js

- Những package không thể thiếu trong dự án: `npm i morgan --save-dev`, `npm i helmet --save-dev`, `npm i compression --save-dev`
  - morgan: in ra các log khi người dùng gửi request
  - helmet: Nó là cái mũ bảo hiểm để ngăn chặn lộ thông tin. Ngăn bên thứ 3 truy cập vào. Ví dụ: khi hacker tấn công vào nó sẽ nhìn header của chúng ta coi chúng ta đang xài công nghệ để mà tấn công
  - compression: Giảm thiểu băng thông cho chúng ta
