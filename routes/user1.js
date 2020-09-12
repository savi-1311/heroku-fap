const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const mySqlConnection = require("../db/db")
let user1

router.get("/register", (req, res) => {
  if (!req.session.user1) {
    res.status(200).render('Register1')
  } else res.status(401).render("logout1",{user1:req.session.user1})
})


router.post("/register", (req, res) => {

    const { name, email, password, password2, phone, address } = req.body;
    
    let errors = [];
    
     
    
    if (!name || !email || !password || !password2 || !phone || !address) {
    
    errors.push({ msg: "Please enter all fields" });
    
    }
    
     
    
    if (password != password2) {
    
    errors.push({ msg: "Passwords do not match" });
    
    }
    
     
    
    if (password.length < 6) {
    
    errors.push({ msg: "Password must be at least 6 characters" });
    
    }
    
    mySqlConnection.query(
    
    "SELECT * FROM user1 WHERE email = ?",
    
    [email],
    
    (err, rows) => {
    
    if (err) res.status(500).send(err);
    
    else if (rows.length){
      res.redirect("/emailexists1");
    }
    
    else if (errors.length > 0) {
    
    res.statusCode = 400;
    
    res.send(errors);
    
    } else {
    
    pwdHash = bcrypt.hashSync(password, 10);
    
    var sql = `INSERT INTO user1 (name, email, phone, pwdHash, address) VALUES ?`;
    
    const values = [[name, email, phone, pwdHash, address]];
    
     
    
    mySqlConnection.query(sql, [values], function(err) {
    
    if (err) res.status(500).send(err);
    
    else 
    {res.status(200).redirect('/')}
    
    });
    
    }
    
    }
    
    );
    
    });

    router.post("/login", (req, res) => {
      const { email, password } = req.body
      mySqlConnection.query(
        "SELECT * FROM user1 WHERE email = ?",
        [email],
        (err, rows) => {
          if (err) res.status(500).send(err)
          user1 = rows[0]
          if (user1) {
            const result = bcrypt.compareSync(password, user1.pwdHash)
            if (result) {
              req.session.user1 = user1
              res.status(200).redirect('/home2?login+sucess')
            } else{
              res.redirect("/pwdincorrect1");
            }
          } else {
            res.redirect("/emailnot1");
          }
        },
      )
    })

    router.get("/login", (req, res) => {
      if (!req.session.user1)
        res.status(200).render('login1')
        else res.status(401).render("logout1",{user1:req.session.user1})
    });
    
    router.get("/logout", (req, res) => {
      if (req.session.user1) {
        req.session.destroy(() => {
          res.status(200).redirect('/')
        })
      } else {
        res.status(400).redirect("/loginerror")
      }
    })

    router.post("/cart", (req, res) => {
      if (req.session.user1) {
        const {dishname ,dishprice, quantity, dishno } = req.body
    
          var sql = `INSERT INTO cart (dishname, dishprice, quantity, dishno ,customerid) VALUES ?`
          const values = [
            [dishname, dishprice, quantity, dishno ,req.session.user1.customerid],
          ]
    
          mySqlConnection.query(sql, [values], err => {
            if (err) res.status(500).send(err)
            else
            res.status(200).redirect('back')
          })
      
      } else res.status(401).redirect("/loginerror")
    })
    


    router.get('/cart', (req, res) => {
      if (req.session.user1)
      {
        mySqlConnection.query(
          "SELECT * FROM user1 WHERE customerid = ?",[req.session.user1.customerid],
          (err, rows) => 
          {
            if (err) res.status(500).send(err)
            else
            {
              mySqlConnection.query(
                "SELECT orderid ,dishprice, quantity, dishname ,(dishprice*quantity) as dishtotal  from cart WHERE customerid = ?",[req.session.user1.customerid],
                (err, rows) => 
                {
                  if (err) res.status(500).send(err)
                  else
                  {
                  res.status = 200;
                  res.render('cart', {cart : rows , user1 : req.session.user1})
                  }
                },)
              }
            },)
          }
          else res.redirect("/loginerror")
        })

        router.get("/cart/delete/:orderid", (req, res) => {
          if (req.session.user1) {
            mySqlConnection.query(
              "SELECT * FROM cart WHERE orderid = ? AND customerid = ?",
              [req.params.orderid, req.session.user1.customerid],
              (err, rows) => {
                if (err) res.status(500).send(err)
                else if (!rows.length) {
                  res.status = 401;
                  res.redirect('cart')
                }
                else {
                  mySqlConnection.query(
                    "DELETE FROM cart WHERE orderid = ?",
                    [req.params.orderid],
                    (err) => {
                      if (err) res.status(500).send(err)
                      else {
                        res.status = 200;
                        res.redirect('/user1/cart');
                      }
                    },
                  )
                }
              },
            )
          } else {
            res.redirect("/loginerror")
          }
        })
        router.post("/update", (req, res) => {
          if (req.session.user1) {
            const { name, address } = req.body
            mySqlConnection.query(
              "UPDATE user1 SET name=?, address=? WHERE customerid = ?",
              [name, address, req.session.user1.customerid],
              (err, rows) => {
                if (err) throw err
                req.session.user1 = { ...req.session.user1, ...req.body }
                res.send(req.session.user1)
              },
            )
          } else res.rendirect("/loginerror")
        })

        router.get("/cart/pay",(req,res) => {
          if(req.session.user1){
          mySqlConnection.query(
            "SELECT dishname, orderid, SUM(dishprice*quantity) AS carttotal FROM cart WHERE customerid = ?",[req.session.user1.customerid],(err,rows)=>
            {
              if(err) throw err
              res.render('pay',{user1 : req.session.user1, cart : rows})
            }
          )
          }
          else res.redirect("/loginerror")
        })

        router.get("/cart/pay/ratinglist",(req,res) => {
          if(req.session.user1){
          mySqlConnection.query(
            "SELECT * FROM cart WHERE customerid = ?",[req.session.user1.customerid],(err,rows)=>
            {
              if(err) throw err
              else
              {
              res.render('ratinglist',{user1 : req.session.user1, cart : rows})
              }
            }
          )
          }
          else res.redirect("/loginerror")
        })

        router.get("/cart/pay/rating:dishno",(req,res) => {
          if(req.session.user1){
            mySqlConnection.query(
              "SELECT * FROM Menu WHERE dishno = ? ",[req.params.dishno],(err,rows) => 
              {
                if(err) throw err
                else{
                res.status(200).render("rating",{user1 : req.session.user1, Menu : rows});
                }
              }
            )
            }
              
          
          else res.redirect("/loginerror")}
        )

        router.post("/cart/pay/rating:dishno",(req,res) => {
          if(req.session.user1){
            const {rating} = req.body
            var sql = `INSERT INTO ratings (dishno, rating) VALUES ?`
            const values = [
              [req.params.dishno, rating],
            ]
            mySqlConnection.query(sql, [values], function(err) {
    
              if (err) res.status(500).send(err)
            else{
             mySqlConnection.query("SELECT AVG(rating) AS avgrate FROM ratings WHERE dishno = ?",[req.params.dishno], (err , rows)=> {
    
              if (err) res.status(500).send(err)
              
              else{ 
              mySqlConnection.query(`UPDATE Menu SET ratingdish = ? WHERE dishno = ?`,[ rows[0].avgrate, req.params.dishno], (err , result)=> {
                if (err) res.status(500).send(err)
                else{
                  res.status(200).redirect("/user1/cart/pay/ratinglist")
                }
              })
              }
              
              })}
          })}
          else res.redirect("/loginerror")
        })

        router.post("/cart/pay/complete", (req, res) => {
          if (req.session.user1) 
          {
            mySqlConnection.query("DELETE FROM cart WHERE customerid = ?", [req.session.user1.customerid] ,(err,rows) =>{
              if(err) throw (err)
              else{
                res.redirect("/home2")
              }
            }
            )
          } 
          else res.redirect("/loginerror")
        })


module.exports = router 