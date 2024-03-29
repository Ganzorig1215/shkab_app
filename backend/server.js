const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const path = require("path");
const db = require("./controller/dbconnect");
const PORT = process.env.PORT || 4000;
const http = require("http");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cardRouter = require("./routes/card");
const nodemailer = require("nodemailer");
const { info, error } = require("console");
dotenv.config({ path: "../config.env" });
// app.use("/", cardRouter);
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ganzorig@mtcone.net",
    pass: "99972613Aa",
  },
});
app.post("/users/create", (req, res) => {
  const {
    userNumber,
    userName,
    address,
    specialNote,
    stationNumber,
    longMetr,
    wardrobeNumber,
    wardrobeClass1,
    wardrobeClass2,
    tavisan,
    shiljuulsen,
    huraasan,
    nomerSolison,
    nerSolison,
  } = req.body;
  console.log(req.body);
  try {
    db.query(
      "INSERT INTO userscard (usernumber, username, address, specialNote, stationNumber, longMetr, wardrobeNumber, wardrobeClass1, wardrobeClass2, install, transfer, collect, changeNumber, changeName, createDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())",
      [
        userNumber,
        userName,
        address,
        specialNote,
        stationNumber,
        longMetr,
        wardrobeNumber,
        wardrobeClass1,
        wardrobeClass2,
        tavisan,
        shiljuulsen,
        huraasan,
        nomerSolison,
        nerSolison,
      ]
    );
    console.log(req.body);
    return res.status(200).json({
      success: true,
      message: "Амжилттай хадгаллаа",
      send: req.body,
    });
  } catch (error) {
    console.error("Алдаа гарлаа:", error);
    return res.status(500).json({
      success: false,
      message: "Дотоод серверийн алдаа",
    });
  }
});
app.post("/send-code", (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const mailOptions = {
    from: "ganzorig@mtcone.net",
    to: email,
    subject: "Verification Code",
    text: `Your verification code is: ${code}`,
  };
  // console.log(email);
  // console.log(req.body);
  // console.log(code);
  // console.log(mailOptions);
  // console.log(info);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent:", info.response || email, code);
      res.status(200).send("Email sent successfully");
    }
  });
  // const sendCode = async (email, code) => {
  //   try {
  //     const mailOptions = {
  //       from: "ganzorig@mtcone.net",
  //       to: email,
  //       subject: "Verification Code",
  //       text: `Your verification code is: ${code}`,
  //     };
  //     console.log(code);
  //     console.log(sendCode);
  //     console.log(email);
  //     const result = await transporter.sendMail(mailOptions);
  //     console.log("Email sent successfully:", result);
  //     return true;
  //   } catch (error) {
  //     console.error("Error sending email:", error);
  //     return false;
  //   }
  // };

  // // Example usage:
  // const email = "lhganzorig1215@gmail.com";
  // const code = "870250"; // This should be the generated code

  // sendCode(email, code);
});
app.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  try {
    // Нууц үгсийг харьцуулах
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Нууц үг таарахгүй байна",
      });
    }

    // Нууц үгийг хашлах
    const hashedPassword = await bcrypt.hash(password, 10);

    // Хашлагдсан нууц үгтэй хамт бүртгэх
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?,?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    return res.status(201).json({
      success: true,
      message: "Хэрэглэгч амжилттай бүртгэгдлээ",
    });
  } catch (error) {
    console.error("Бүртгэл хийхэд алдаа гарлаа:", error);
    return res.status(500).json({
      success: false,
      message: "Дотоод серверийн алдаа",
    });
  }
});
app.get("/registration", async (req, res) => {
  try {
    const registerData = await db.query("SELECT * FROM users");
    return res.status(200).json({
      success: true,
      data: registerData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
    });
  }
});
app.put("/addAdmin/:id", (req, res) => {
  const { id } = req.params;
  req.body.role = "admin";
  const { role } = req.body;
  try {
    db.query("UPDATE users SET role=? WHERE ID = ?", [role, id]);
    return res
      .status(200)
      .json({ updated: true, message: "Амжилттай шинэчиллээ" });
  } catch (error) {
    console.error("aldaa garlaa:", error);
    return res.status(500).json({
      success: false,
      message: "Шинэчилж чадсангүй",
    });
  }
});

app.put("/removeAdmin/:id", (req, res) => {
  const { id } = req.params;
  req.body.role = "user";
  const { role } = req.body;
  try {
    db.query("UPDATE users SET role=? WHERE ID = ?", [role, id]);
    return res
      .status(200)
      .json({ updated: true, message: "Амжилттай шинэчиллээ" });
  } catch (error) {
    console.error("aldaa garlaa:", error);
    return res.status(500).json({
      success: false,
      message: "Шинэчилж чадсангүй",
    });
  }
});
// Нэвтрэх
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await db.query("SELECT * FROM users WHERE `email` = ?", [
      email,
    ]);

    if (!userData || userData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Хэрэглэгч олдсонгүй",
      });
    }

    const storedHashedPassword = userData[0].password;
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Нууц үг таарахгүй байна!!!",
      });
    }
    const userWithoutPassword = { ...userData[0] };
    const { role } = userData[0];
    const { name } = userData[0];
    delete userWithoutPassword.password;
    const token = jwt.sign(
      { userId: userWithoutPassword.id, email: userWithoutPassword.email },
      "your_secret_key",
      {
        expiresIn: "1h",
      }
    );
    return res.status(200).json({
      success: true,
      token: token,
      role: role,
      name: name,
    });
  } catch (error) {
    console.error("Нэвтрэх үед алдаа гарлаа:", error);
    return res.status(500).json({
      success: false,
      message: "Дотоод серверийн алдаа",
    });
  }
});

// POST хүсэлтийг хүлээн авах
app.post("/enjury/:userId", (req, res) => {
  const userId = req.params.userId;
  const { garsanGemtel, shalgalt, fixing, fixed } = req.body;
  console.log(req.body);
  console.log(userId);

  try {
    db.query(
      "INSERT INTO enjuryCard (enjury, `check`, fixing, fixed, userId) VALUES (?,?,?,?,?)",
      [garsanGemtel, shalgalt, fixing, fixed, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Амжилттай хадгаллаа",
      send: req.body,
    });
  } catch (error) {
    console.error("Алдаа гарлаа:", error);
    return res.status(500).json({
      success: false,
      message: "Дотоод серверийн алдаа",
    });
  }
});

app.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const userData = await db.query("SELECT * FROM userscard ");

    if (req.query.page) {
      const paginatedData = userData.slice(startIndex, endIndex);

      return res.status(200).json({
        currentPage: page,
        totalPages: userData.length,
        users: paginatedData,
      });
    }
    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
    });
  }
});
app.get("/enjury", async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const { userId } = req.query;
    const enjuryData = await db.query(
      `SELECT * FROM enjuryCard WHERE userId = '${userId}'`
    );
    return res.status(200).json({
      success: true,
      data: enjuryData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      succes: false,
    });
  }
});

app.get("/update", async (req, res) => {
  try {
    const { id } = req.query;
    const userData = await db.query(
      `SELECT * FROM userscard WHERE ID = '${id}'`
    );
    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      succes: false,
    });
  }
});
app.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const {
    usernumber,
    username,
    address,
    specialNote,
    stationNumber,
    longMetr,
    wardrobeNumber,
    wardrobeClass1,
    wardrobeClass2,
    install,
    transfer,
    collect,
    changeNumber,
    changeName,
  } = req.body;

  try {
    db.query(
      "UPDATE userscard SET usernumber=?, username=?, address=?, specialNote=?, stationNumber=?, longMetr=?, wardrobeNumber=?, wardrobeClass1=?, wardrobeClass2=?, install=?, transfer=?,  collect=?, changeNumber=?, changeName=?, createDate=NOW() WHERE ID = ?",
      [
        usernumber,
        username,
        address,
        specialNote,
        stationNumber,
        longMetr,
        wardrobeNumber,
        wardrobeClass1,
        wardrobeClass2,
        install,
        transfer,
        collect,
        changeNumber,
        changeName,
        id,
      ]
    );
    return res
      .status(200)
      .json({ updated: true, message: "Амжилттай шинэчиллээ" });
  } catch (error) {
    console.error("aldaa garlaa:", error);
    return res.status(500).json({
      success: false,
      message: "Дотоод серверийн алдаа",
    });
  }
});

app.delete("/delete/:deleteUserId", (req, res) => {
  const id = req.params.deleteUserId;
  db.query("DELETE FROM userscard  WHERE ID =?", [id], (error, results) => {
    if (error) {
      console.log("Aldaa garlaa", error);
      return res.status(500).json({
        success: false,
        message: "Устгаж чадсангүй",
      });
    }
  })
    .then(() => {
      return res.status(200).json({
        success: true,
        message: "Амжилттай устгалаа",
      });
    })
    .catch((error) => {
      throw error;
    });
  db.query(
    "DELETE FROM enjuryCard  WHERE userId =?",
    [id],
    (error, results) => {
      if (error) {
        console.log("Aldaa garlaa", error);
        return res.status(500).json({
          success: false,
          message: "Устгаж чадсангүй",
        });
      }
    }
  );
});

// Бүртгэл

app.get("/userInfo", async (req, res) => {
  try {
    const userData = await db.query(
      "SELECT * FROM users WHERE name = ? AND email = ?",
      [req.query.name, req.query.email]
    );
    return res.status(200).json({
      succes: true,
      data: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
    });
  }
});
app.delete("/deleteEnjury/:enjuryId", async (req, res) => {
  const enjuryId = req.params.enjuryId;
  try {
    await db.query("DELETE FROM enjuryCard WHERE ID=?", [enjuryId]);

    return res.status(200).json({
      success: true,
      message: "Successfully deleted the injury record",
    });
  } catch (error) {
    console.error("Error deleting enjury record:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
const createUser = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}://${req.host}${req.originalUrl}`);
  next();
};
app.use(createUser);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
