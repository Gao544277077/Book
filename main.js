/*This program is create a book store.I have uses mongodb to create a database called book
 and details of book has three variables: "barcode, name and price". The program is uses mongodb 
 and PUG to CRUD book details on the webpage. And then, I have create another database called
 order, it is uses to build a shooping cart page. In the book detail page, I have create a button called
 add-cart that application will move book's detail to the order page that means I will get the books detail
 in the shooping cart. Finally, I have uses paypal to create an transaction system, it is support to make
 a payment of shooping cart. 
*/
var express=require('express');
var path=require('path');
var http=require("http");
var mongoose=require("mongoose");
var paypal=require("paypal-rest-sdk");
var bodyParser=require('body-parser');
var pug=require('pug');


//CREATE CONNECTION OF THE MONGODB
mongoose.connect('mongodb://localhost/nodekb');
var db= mongoose.connection;
//CONNETE MONGODB
db.once("open",function(){
    console.log("conneted to MongoDB");
});

db.on("error",function(err){    
console.log(err);
});
// uses express lib
var app=express(); 
var Book=require('./nodekb/book');
var Order=require('./nodekb/order');


// SET PATH=BOOK/VIEWS
app.set('view engine','pug');
app.set('views',__dirname+'/view');

app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());
//to calculate total price of order
total=0;
// Create a record of shooping cart
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
//Create a shooping cart page and uses 'order' database 
app.get('/shoopingcart',function(req,res){
    Order.find({},function(err,orders){
            if(err){
                return err;
            } else {
        res.render('shoopingcart',{
            title:"shooping cart ",
            orders:orders,
           });
    };
    });
});

app.get('/firebasetest',function(req,res){
    Book.find({},function(err,books){
            if(err){
                return err;
            } else {
        res.render('firebasetest',{
            title:"shooping cart ",
            books:books,
           });
    };
    });
});
// create edit form to edit book detail
app.post('/book/update_book/:id',function(req,res){   
    var book={}; 
    book.barcode=req.body.barcode;
    book.name=req.body.name;
    book.price=req.body.price;
    var query={_id:req.params.id}
    Book.update(query,book, function(err){
        if(err){
            return err;
        } else{
            console.log("sumbitted")
            res.redirect('/');
        }
    });
});

// clean system to clean detail of cart.
app.get('/clean',function(req,res){
    Order.find({},function(err,order,amount){
        if(err){
            return err;
        } else {
            total=0;
            db.collection('orders').drop();
            res.redirect("/");
    }
    });
});


//CREATE ID page to modify data with ID
app.get('/bookID',function(req,res){
    Book.find({},function(err,book){
        if(err){
            return err; 
        } else {
        res.render('bookID',{
            title:"PubHub ",
            book:book
        });
    }
    });
});
//create edit page to update book infomation
app.get('/edit',function(req,res){
    Book.find({},function(err,book){
        if(err){
            return err;
        } else {
        res.render('edit',{
            title:"PubHub ",
            book:book
        });
    }
    });
});
//uses id to get data
app.get('/book/:id',function(req,res){
        Book.findById(req.params.id, function(err, book){
            res.render('book',{
                title:'book detail',
                book:book,
           });
        });
    });

app.get('/firebase/:id',function(req,res){
    Book.findById(req.params.id, function(err, book){
        res.render('book',{
            title:'book detail',
            book:book
        });
    });
})
// uses order's id to list the detail of order in the web.
app.get('/order/:id',function(req,res){
    Order.findById(req.params.id, function(err, order){
        res.render('order',{
            title:order.name,
            order:order
        });
    });
})
// create a paypal page to sumbit the payment of transaction
app.get('/paypal/',function(req,res){
    Order.findById(req.params.id, function(err, order){
        res.render('order',{
            title:"paypal order",
            order:order
        });
    });
})
//use Eidt key to edit book detail
app.get('/book/update_book/:id',function(req,res){
    Book.findById(req.params.id, function(err, book){
        res.render('update_book',{
            title:"Edit Book",
            book:book
        });
    });
})
// create add book page
app.get('/add',function(req,res){
    res.render('add_book',{
        title:'Add book'
    });
});

// create a adding form to add new book 
app.post('/add',function(req,res){   
    var book=new Book();
    book.barcode=req.body.barcode;
    book.name=req.body.name;
    book.price=req.body.price;
// save data to mongodb 
    book.save(function(err){
        if(err){
            return err;
        } else{
            console.log("sumbitted")
            res.redirect('/');
        }
    });
});



// uses DELETE key to delete book
app.delete('/book/:id', function(req,res){
    var query={_id:req.params.id}
    Book.remove(query, function(err){
        if(err){
            return err;
        }
        res.send("deleted");
    });
});
//Remove the item in the shooping cart 
app.delete('/order/:id', function(req,res){
    var query={_id:req.params.id}
    Order.remove(query, function(err){
        if(err){
            return err;
        }else{
            res.send('deleted');   
        }   
    });
});
// To calcualte the total price and create a record.
app.get('/paypal/:id',function(req,res){
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
                res.redirect('/shoopingcart');
            };
    });
    
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
                        "name": I,
                        "sku": "001",
                        "price": 11,
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
// to sumbit  paypament in the paypal pay page and it will cleaning the data in the orders
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
// create a service call localhost:3000
app.listen (3000,function(){
        console.log('Server started on port 3000...');
});

