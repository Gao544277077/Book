/*This program is create a book store.I have uses mongodb to create a database called book
 and details of book has three variables: "barcode, name and price". The program is uses mongodb 
 and PUG to CRUD book details on the webpage. After then,I have create a database called 'user' and I also
 have uses Passport config to build a registraction system with 'user' database, And then,I create third 
 database called order, it is uses to build a shooping cart page. In the book detail page, I have create
 a button called add-cart that application will move book's detail to the order page that means I will get 
 the books detail in the shooping cart. Finally, I have uses paypal to make a transaction system, it is 
 support to make a payment of shooping cart. 
*/
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var paypal=require("paypal-rest-sdk");
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var config = require('./config/database');


mongoose.connect(config.database);
var db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for errors of mongodb
db.on('error', function(err){
  console.log(err);
});

// Init App
var app = express();

// Bring in models
var Book = require('./models/book');
var Order = require('./models/order');
var User = require('./models/user');


// use pug engine and set path=views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Create express session 
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express Messages 
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator 
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Create Passport config to build a registraction system
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});
total=0;
I=[];
  
//CRETE HOME PAGE to view and modify data with bookname
app.get('/',function(req,res){
    Book.find({},function(err,books){
        if(err){
            return err;
        } else {
        res.render('index',{
            title:"PubHub ",
            books:books
        });
    }
    });
});

//Remove the item in the shooping cart 
app.delete('/books/order/:id', function(req,res){
    Order.findById(req.params.id, function(err, order){
        total=total-order.price;
    });
    var query={_id:req.params.id};
    Order.remove(query, function(err){
        if(err){
            return err;
        }else{
            res.send('deleted');   
        }   
    });
});
// config of paypal sanbox
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Af_29Do5H5oEeEX8sT8oMj_3_dMF5YKHSZFlpPDST4dR1Z85iDAhMnby0kgCZpWiXMZOlsvqI4lHPRsG',
    'client_secret': 'ENUl9V1cJwdD8j_iR4NMSqfznipUwOH3zCrTq1ti-sY44v4ekBVVb-Tk8YcdcV-ouraj2xbG42EC-Y6c'
  });

//post the order to paypal payment page, and add order to the paypal page. 
app.post('/pay/',function(req,res){
            var create_payment_json = {
            "intent": "sale",
            "payer": {
            "payment_method": "paypal"
            },
            "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": 'order',
                        "sku": "001",
                        "price": total,
                        "currency": "USD",
                        "quantity": 1
                    }]
            },
            "amount": {
                "currency": "USD",
                "total": total
             },
            "description": "This is the payment description."
        }]
    };
//create a paypal payment_json page, to get the data of payment
paypal.payment.create(create_payment_json, function(err,payment){
    if(err){
        return err;
    } else{
        for(let i=0; i<payment.links.length; i++)
        if(payment.links[i].rel === 'approval_url'){
                res.redirect(payment.links[i].href);
        }
    }
});
});
// create a confirm page and it will cleaning all data in the orders
app.get('/confirm',function(req,res){
    db.collection('orders').drop();
    res.render('confirm',{
    });
});
// when payment success to pay that post the payment data.
app.get("/success",function(req,res){
    const payerId =req.query.PayerID;
    const paymentId=req.query.paymentId;

    const execute_payment_json={
        "payer_id" : payerId,
        "transactions" : [{
            "amount" : {
                "currency" : "USD",
                "total" : total
            }
        }]
    };

// to confirm payment
paypal.payment.execute(paymentId,execute_payment_json, function (err, payment) {
        if(err){
        console.log(err);
        return err;
    } else {
        
            console.log(JSON.stringify(payment));
            res.render("confirm");
    }
    

});
});
// cancel the payment
app.get('/cancel', function(req,res){
    res.send('Cancelled',{

    });
})


// clean system to clean detail of cart.
app.get('/clean',function(req,res){
    Order.find({},function(err,order){
        if(err){
            return err;
        } else {
            total=0;
            I="";
            db.collection('orders').drop();
            res.redirect("/");
    }
    });
});

//Create a shooping cart page and uses 'order' database 
app.get('/books/shoopingcart',function(req,res){
    Order.find({},function(err,orders){
            if(err){
                return err;
            } else {
                console.log(orders);
        res.render('shoopingcart',{
            title:"shooping cart ",
            orders:orders,
           });
    };
    });
});

// To calcualte the total price and create a shooping record.
app.get('/books/paypal/:id',function(req,res){
    Book.findById(req.params.id, function(err, book){
        total=total+book.price;
        name=book.name;
        name=String(name);
        var order=new Order();
        order.name=name;
        order.price=book.price;
        I+=name+",";
        order.save(function(err){
            if(err){
                return err;
            } else{
                res.redirect('/books/shoopingcart');
            };  
    });
    
    });
});

let books = require('./routes/books');
app.use('/books', books);
let users = require('./routes/users');
app.use('/users', users);

// create a service call localhost:3000
app.listen (3000,function(){
        console.log('Server started on port 3000...');
});

