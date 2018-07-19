var express=require('express');
var path=require('path');
var http=require("http");
var mysql=require('mysql');
var mongoose=require("mongoose");
var paypal=require("paypal-rest-sdk");
var bodyParser=require('body-parser');
var ejs=require('ejs');
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

var app=express(); 
var Book=require('./nodekb/book');
// SET PATH=BOOK/VIEWS
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');


app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());
function pageNotFound(response) {
    response.writeHead(404,{"Content-Type":"text/plain"});
    response.write("Error,404,page NotFound");
    response.end();
}


total=0;
I=[];
//CRETE HOME PAGE to view and modify data with bookname
app.get('/',function(req,res){
    Book.find({},function(err,books){
        if(err){
            pageNotFound(response);
        } else {
        res.render('index',{
            title:"PubHub ",
            books:books
        });
    }
    });
});

app.get('/clean',function(req,res){
    Book.find({},function(err,books){
        if(err){
            pageNotFound(response);
        } else {
        total=0;
        I=" ";
        res.render('index',{
            title:"PubHub ",
            books:books
        });
    }
    });
});

app.get('/success',function(req,res){
    Book.find({},function(err,books){
        if(err){
            pageNotFound(response);
        } else {
        res.render('success',{
            title:"PubHub ",
        });
    }
    });
});


//CREATE ID page to modify data with ID
app.get('/bookID',function(req,res){
    Book.find({},function(err,books){
        if(err){
            pageNotFound(response); 
        } else {
        res.render('bookID',{
            title:"PubHub ",
            books:books
        });
    }
    });
});
//create edit page to update book infomation
app.get('/edit',function(req,res){
    Book.find({},function(err,books){
        if(err){
            pageNotFound(response);
        } else {
        res.render('edit',{
            title:"PubHub ",
            books:books
        });
    }
    });
});
//uses id to get data
app.get('/book/:id',function(req,res){
    Book.findById(req.params.id, function(err, book){
        res.render('book',{
            book:book
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
            pageNotFound(response);
        } else{
            console.log("sumbitted")
            res.redirect('/');
        }
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
            pageNotFound(response);
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
            pageNotFound(response);
        }
        res.send("deleted");
    });
});
app.get('/paypal',function(req,res){
    
    Book.findById(req.params.id, function(err, book){
        res.render('paypal',{
            title:"Edit Book",
            book:book
        
    });
    
    });
});
app.get('/paypal/:id',function(req,res){
    
    Book.findById(req.params.id, function(err, book){
        total=total+book.price;
        name=book.name;
        name=String(name);
        I+=name+",";
        res.render('paypal',{
            title:"Edit Book",
            book:book
        
    });
    
    });
});
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Af_29Do5H5oEeEX8sT8oMj_3_dMF5YKHSZFlpPDST4dR1Z85iDAhMnby0kgCZpWiXMZOlsvqI4lHPRsG',
    'client_secret': 'ENUl9V1cJwdD8j_iR4NMSqfznipUwOH3zCrTq1ti-sY44v4ekBVVb-Tk8YcdcV-ouraj2xbG42EC-Y6c'
  });


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
                        "sku": "item",
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


paypal.payment.execute(paymentId,execute_payment_json, function (err, payment) {
    if(err){
        console.log(err);
        return err;
    } else {
        
        console.log(JSON.stringify(payment));
        res.redirect('/success');
    }
});
});

app.get('/cancel', function(req,res){
    res.send('Cancelled',{

    });
})
// create a service call localhost:3000
app.listen (3000,function(){
        console.log('Server started on port 3000...');
});