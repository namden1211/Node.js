var express = require('express');
var app = express();
var mysql = require('mysql');
var cors = require('cors');
const session = require('express-session');
var cookieParser = require('cookie-parser');
// lien ket mysql
var con = mysql.createConnection({
  host: "localhost",
  database: 'tot_nghiep',
  user: "root",
  password: "123456"
});

con.connect(function (err) {
  if (err) throw err;
});
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// api nguoi dung
app.get('/user', function (req, res) {
  con.query("SELECT * FROM users", function (err, result, fields) {
    if (err) throw err;
    res.status(200);
    res.send(result);
  });
});

// api tim kiem
app.get('/timkiem', function (req, res) {
  let tukhoaa = req.query.tukhoa;
  res.status(200);
  con.query(`SELECT * FROM tin_tuc WHERE tieude LIKE ? ORDER BY ID DESC`, [`%${tukhoaa}%`], function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

//api bai bao
app.get('/tintuc', function (req, res) {
  res.status(200);
  con.query("SELECT * FROM tin_tuc ORDER BY ID DESC", function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

// api chi tiet
app.get('/chitiet', function (req, res) {
  res.status(200);
  let chitiett = req.query.linkchitiet;
  let chitiet = [];
  con.query("SELECT * FROM tin_tuc", function (err, result, fields) {
    if (err) throw err;
    for (let i = 0; i < result.length; i++) {
      let cars = result[i];
      let dauCheo = "/";
      let timChu = cars.ID;
      if (chitiett.includes(dauCheo.concat(timChu))) {
        chitiet = cars;
      }
    }
    res.send(chitiet);
  });
});

// api danh muc
app.get('/danhmuc', function (req, res) {
  let danhmuc = req.query.linkdanhmuc;
  res.status(200);
  con.query(`
        SELECT 
            a.ID, a.tieude, a.img, a.noidung, a.noidungchitiet, a.ngaydang,
            d.danhmuc
        FROM 
            ketnoi k
        JOIN 
            tin_tuc a ON k.IDbaibao = a.ID
        JOIN 
            danhmuc d ON k.IDdanhmuc = d.IDdanhmuc
        WHERE 
            d.danhmuc = ?;
    `, [danhmuc], function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

// them tai khoan
app.post('/themtaikhoan', function (req, res) {
  let { taikhoan, matkhau } = req.body;
  res.status(200);
  con.query(`insert into users(taikhoan,matkhau,quyen)
  values(?, SHA2(?, 256), "nhanvien");`, [taikhoan, matkhau], function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

// xoa tai khoan
app.post('/xoataikhoan', function (req, res) {
  let { xoabai } = req.body;
  res.status(200);
  con.query(`delete from users where ID = "${xoabai}"`, function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

// doi mat khau
app.post('/doimatkhau', function (req, res) {
  let { id, matKhaumoi, nhapLaimatkhaumoi } = req.body;
  res.status(200);
  con.query(`update users set matkhau = SHA2(?, 256) where ID = ?`, [nhapLaimatkhaumoi, id], function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

app.get('/themid', function (req, res) {
  res.status(200);
  con.query("SELECT * FROM tin_tuc", function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

// danh muc
app.get('/selectdanhmuc', function (req, res) {
  res.status(200);
  con.query("SELECT * FROM danhmuc", function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

// tinhot
app.get('/tinhot', function (req, res) {
  res.status(200);
  con.query("SELECT * FROM tin_tuc where ID = '23'", function (err, result, fields) {
    if (err) throw err;
    res.send(result[0]);
  });
});

// quan ly tin tuc
app.get('/quanlytintuc', function (req, res) {
  let page = parseInt(req.query.page);
  let itemsPerPage = 16;
  let offset = (page - 1) * itemsPerPage;
  res.status(200);
  con.query(`SELECT * FROM tin_tuc LIMIT ? OFFSET ?`, [itemsPerPage, offset], function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

app.post('/xoatintuc', function (req, res) {
  let { xoabai } = req.body;
  res.status(200);
  con.query(`delete from tin_tuc where ID = "${xoabai}";`, function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

// xoa danh muc
app.post('/xoadanhmuc', function (req, res) {
  let { xoadanhmuc } = req.body;
  res.status(200);
  con.query(`delete from danhmuc where IDdanhmuc = "${xoadanhmuc}"`, function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

// them danh muc
app.post('/themdanhmuc', function (req, res) {
  let { id, tendanhmuc, danhmuchienthi } = req.body;
  res.status(200);
  con.query(`insert into danhmuc(IDdanhmuc,danhmuc,danhmuchienthi)
  values(?, ?, ?);`, [id, tendanhmuc, danhmuchienthi], function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

// doi ten danh muc
app.post('/doitendanhmuc', function (req, res) {
  let { id, tendanhmucmoi, nhaptendanhmucmoi } = req.body;
  res.status(200);
  con.query(`update danhmuc set danhmuchienthi = ? where IDdanhmuc = ?`, [nhaptendanhmucmoi, id], function (err, result, fields) {
    if (err) throw err;
  });
  con.query(`update danhmuc set danhmuc = ? where IDdanhmuc = ?`, [tendanhmucmoi, id], function (err, result, fields) {
    if (err) throw err;
    res.json(result);
  });
});

// bai goi y
app.get('/baigoiy', function (req, res) {
  res.status(200);
  con.query("SELECT * FROM tin_tuc limit 22", function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

// login
app.post('/dangnhap', function (req, res) {
  res.status(200);
  let { taikhoan, matkhau } = req.body
  con.query(`SELECT SHA2(?, 256) AS hashed_value`, [matkhau], function (err, result, fields) {
    if (err) throw err;
    con.query(`SELECT * FROM users WHERE taikhoan = ? AND matkhau = ?`, [taikhoan, result[0].hashed_value], function (err, result1, fields) {
      if (err) throw err;
      if (result1.length > 0) {
        req.session.user = result1[0];
        res.json(result1[0]);
      } else {
        res.json(result1[0]);
      }
    });
  });
});

// check sessions
function checkSession(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.json(null);
  }
}

// su dung check sessions
app.get('/checkvar', checkSession, (req, res) => {
  res.json(req.session.user); 
});

// dang xuat
app.get('/dangxuat', function (req, res) {
  res.status(200);
  res.clearCookie('connect.sid');
  req.session.destroy();
});
 
// dang bai
app.post('/post', function (req, res) {
  let { id, tieude, img, noidung, idketnoi, noidungchitiet, ngaydang } = req.body;
  con.query(`insert into tin_tuc(ID,tieude,img,noidung,noidungchitiet,ngaydang,nguoidang)
  values(?, ?, ?, ?, ?, ?, ?);`, [id, tieude, img, noidung, noidungchitiet, ngaydang, req.session.user.taikhoan], function (err, result, fields) {
    if (err) throw err;
    res.sendStatus(200);
  });
  con.query(`INSERT INTO ketnoi (IDbaibao, IDdanhmuc )
  VALUES(?,?);`, [id, idketnoi], function (err, resul, fields) {
    if (err) throw err;
  });
});

// sua bai viet
app.get('/suabaiviet', function (req, res) {
  res.status(200);
  let baisua = req.query.idbaisua;
  con.query(`SELECT * FROM tin_tuc where id = ?`, [baisua], function (err, result, fields) {
    if (err) throw err;
    res.send(result[0]);
  });
});

app.post('/capnhatbaivietdasua', function (req, res) {
  let { id, tieude, img, noidung, idketnoi, noidungchitiet, ngaydang, nguoidang } = req.body;
  res.status(200);
  con.query(`UPDATE tin_tuc set tieude = ?, img = ?, noidung = ?, noidungchitiet = ?, ngaydang = ?, nguoidang = ?
  where ID = ?;`, [tieude, img, noidung, noidungchitiet, ngaydang, nguoidang, id], function (err, result, fields) {
    if (err) throw err;
  });
});


app.listen(3000);
