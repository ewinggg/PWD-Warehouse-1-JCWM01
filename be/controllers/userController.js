//  FUNGSI CONTROLLER //
// handle request and response
// terima request, validate body, etc.
// ... (Business Logic Di Service)
// kirim response

const { db, query } = require("../database/index"); //mysql
const moment = require("moment"); // ubah format tanggal
const Crypto = require("crypto"); // for encrypt
//Hashing
const bcrypt = require("bcrypt");
const saltRounds = 10;
//Middleware
const { createToken } = require("../helper/createToken");
const { createTokenF } = require("../helper/forgotPassword/createTokenF");
const nodemailer = require("../helper/nodemailer");

module.exports = {
  // REGISTER //
  Register: async (req, res) => {
    //User Data Input//
    let { fullName, username, email, password } = req.body;
    try {
      //Check Email
      const checkEmail = await query(`SELECT * FROM users WHERE email = ${db.escape(email)} ;`)
      if (checkEmail.length > 0) {
        res.send({
          message: "This Email Already Registered",
          message1: "Try Again With Different Email",
          success: false,
        });
        return;
      } else {
        //Hash Password
        const hashPassword = await bcrypt.hash(password, saltRounds)
        password = hashPassword
        //Insert User Data To DB 
        const registerQuery = await query(`INSERT INTO users VALUES 
                (null, ${db.escape(fullName)}, ${db.escape(username)}, ${db.escape(email)}, ${db.escape(password)},3, "/images/profile-default.png", 0, 3, null  );`)

        if (registerQuery) {
          //Get User Data in DB
          const getUserData = await query(`SELECT * FROM users WHERE idUser = ${registerQuery.insertId};`)
          // Create Token
          delete getUserData[0].password;
          let { idUser, fullName, username, email, idRole, isVerified, } = getUserData[0];
          let Token = createToken({ idUser, fullName, username, email, idRole, isVerified, });
          // Send Verify Email
          let mail = {
            from: `Admin <ayyasluthfi@gmail.com>`,
            to: `${email}`,
            subject: `Acount Verification`,
            html: `<a href="http://localhost:3000/verification/${Token}"> Hello ${username}, Click here to verify your account</a>`,
          };
          await nodemailer.sendMail(mail)
          //Response
          res.status(200).send({
            message:
              "Registration And Login Success ✔, Check your email to verify your account!",
            success: true,
            token: Token,
            dataUser: getUserData[0],
          });
        } else {
          res.status(500).send({
            message: "Registration failed",
            success: false,
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Registration failed",
        success: false,
        error: error
      });
    }
  },

  // ACCOUNT VERIFICATION //
  verification: async (req, res) => {
    //update isVerified
    try {
      await query(`UPDATE users SET isVerified = 1 WHERE idUser = ${req.user.idUser};`)
      res.status(200).send({ message: "account verified", success: true });

    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "account unverified", success: false });
    }
  },

  // LOGIN //
  Login: async (req, res) => {
    try {
      const loginQuery = await query(`SELECT * FROM users WHERE email=${db.escape(req.body.email)};`)
      //checking user
      if (loginQuery[0]) {
        //user data
        let { idUser, fullName, username, email, password, idRole, isVerified, } = loginQuery[0];
        //hash Password
        const bCryptCompare = await bcrypt.compare(req.body.password, password)
        if (bCryptCompare) {
          delete loginQuery[0].password;
          //check isVerified
          if (isVerified != 1) {
            res.send({ message: "Account Is Not Verified", success: false });
            return;
          } else {
            //Create Token
            let Token = createToken({ idUser, fullName, username, email, idRole, isVerified, });
            res.status(200).send({
              message: "Login Success",
              success: true,
              token: Token,
              dataUser: loginQuery[0],
            });
            return;
          }
        } else {
          res.send({
            message: "Email And Password Doesn't Match",
            success: false,
          });
        }
      } else {
        res.send({ message: "Account Is Not Registered", success: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  // CHECK LOGIN//
  getDataUser: (req, res) => {
    let scriptQuery = `SELECT * FROM users WHERE idUser=${req.user.idUser};`;
    db.query(scriptQuery, (err, results) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Failed To Get User Data", error: err });
      } else {
        delete results[0].password;
        var parsed = moment(results[0].dateOfBirth).format("YYYY-MM-DD");
        results = { ...results[0], dateOfBirth: parsed };
        return res.status(200).send(results);
      }
      delete results[0].password;
      if (results[0].dateOfBirth == null) {
        return res.status(200).send(results[0]);
      }
      var parsed = moment(results[0].dateOfBirth).format("YYYY-MM-DD");
      results = { ...results[0], dateOfBirth: parsed };
      return res.status(200).send(results);
    });
  },

  //EDIT DATA USER PROFILE//
  editDataUser: (req, res) => {
    const idUser = req.user.idUser;
    let { fullName, username, email, gender, dateOfBirth } = req.body;
    if (dateOfBirth === '') {
      dateOfBirth = null
    } else {
      dateOfBirth = moment(dateOfBirth).format("YYYY-MM-DD"); // ubah format jadi YYYY/MM/DD
    }
    let scriptQuery = `UPDATE users SET
     fullName=${db.escape(fullName)},
     username=${db.escape(username)},
     email=${db.escape(email)},
     gender=${db.escape(gender)},
     dateOfBirth=${db.escape(dateOfBirth)}
     WHERE idUser=${db.escape(idUser)} ;`;
    db.query(scriptQuery, (err, results) => {
      if (err) {
        res.status(500).send({
          message: "Gagal mengambil data di database",
          success: false,
          error: err
        });
        return;
      } else {
        db.query(`SELECT * FROM users WHERE idUser=${db.escape(idUser)}`, (err, results) => {
          if (err) {
            res.status(500).send({
              message: "Gagal mengambil data di database",
              success: false,
              error: err
            });
            return;
          }
          return res.status(200).send(results);
        })
      }
    });
  },

  // CHANGE PASSWORD//
  changePasswordUser: (req, res) => {
    let { idUser } = req.user;
    let { newPassword, oldPassword } = req.body.data;

    let scriptQuery = `SELECT password FROM users WHERE idUser=${db.escape(
      idUser
    )}`;
    db.query(scriptQuery, (err, results) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "Data Tidak Ditemukan", success: false, err });
      }
      bcrypt.compare(oldPassword, results[0].password, function (err, isMatch) {
        if (err) {
          return res
            .status(500)
            .send({ message: "Terjadi Kesalahan", success: false, err });
        } else if (!isMatch) {
          return res
            .status(200)
            .send({ message: "Password anda salah", success: false });
        } else {
          //Password match dengan hashing
          //add new password to db
          let { password } = req.body.data;
          bcrypt.hash(password, saltRounds, (error, hash) => {
            if (error) {
            } else {
              password = hash;
              //update password
              let updateQuery = `UPDATE users SET password = "${password}" WHERE idUser = ${req.user.idUser};`;
              db.query(updateQuery, (err, results) => {
                if (err) {
                  res.status(500).send({
                    message: "update password failed",
                    success: false,
                  });
                }
                res.status(200).send({
                  message: "update password success ✔",
                  success: true,
                });
              });
            }
          });
        }
      });
    });
  },

  // FORGOT PASSWORD //
  ForgotPassword: async (req, res) => {
    try {
      const selectUser = await query(`SELECT * FROM users WHERE email =${db.escape(req.body.email)} ;`)
      if (selectUser.length > 0) {
        //Create Token
        let { idUser, fullName, username, email, idRole, isVerified } = selectUser[0];
        let Token = createTokenF({ idUser, fullName, username, email, idRole, isVerified, });
        //Send Verify Email
        let mail = {
          from: `Admin <ayyasluthfi@gmail.com>`,
          to: `${email}`,
          subject: `Acount Verification`,
          html: `<a href="http://localhost:3000/reset-password/${idUser}/${Token}"> Hai ${username}, Click here to Reset your password, this link valid for only 1 hour</a>`,
        };
        //nodemailer
        await nodemailer.sendMail(mail)
        //Response
        res.status(200).send({
          message: "Request Forgot Password Success  ✔",
          success: true,
        });
      } else {
        res.send({ message: "Email Is Not Registered", success: false });
        return;
      }

    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  // VERIFICATION AND UPDATE FORGOT PASSWORD //
  verificationF: async (req, res) => {
    try {
      //New Password
      let newPassword = req.body.newPassword;
      //Hash Password
      const hashPassword = await bcrypt.hash(newPassword, saltRounds)
      newPassword = hashPassword
      //Update Data User in DB
      await query(`UPDATE users SET password = "${newPassword}" WHERE idUser = ${req.user.idUser};`)
      //Response
      res.status(200).send({ message: "update password success ✔", success: true });

    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "update password failed", success: false, error });
    }
  },
};
