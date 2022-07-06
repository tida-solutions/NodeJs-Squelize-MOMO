Hướng dẫn sử dụng

Yêu cầu : Server ( máy tính) đã cài đặt nodejs ( ưu tiên phiên bản mới nhất), nginx , mysql server , git

Hướng dẫn cài đặt

Bước 1 : Tải source về bằng lệnh : git clone https://github.com/d-tech-team/clmm.git rồi sử dụng lệnh 'cd' để vào thư mục đó

Bước 2 : Chạy lệnh 'npm i' để cài các module cần thiết của source

Bước 3 : Chạy lệnh 'npx sequelize-cli db:migrate' để create các table sql vào mysql server

Bước 4 : Chỉnh sửa thông tin database ở file .env, config/config.json

Bước 5 : Cài packaeg pm2 để giữ server nodejs luôn chạy bằng lệnh 'npm i -g pm2'

Bước 6 : Chạy lệnh 'pm2 start server.js --watch' để run server

Hiện tại mật khẩu user đang được mã hóa bằng brcypt, mặc định mình đang để là tiendat mật khẩu đc mã hóa thành $2b$10$TsvaMLxv61dJ9q5YafRfeOfTyRam7JJeK/6u61pcYJ5mLf/GOu0J6 , chỉ cần insert user kèm email vào và login admin để đổi mật khẩu
