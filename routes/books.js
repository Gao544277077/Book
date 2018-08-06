var express = require('express');
var router = express.Router();
var paypal=require("paypal-rest-sdk");
var Book = require('../models/book');
var Order= require('../models/order');
var mongoose=require("mongoose");
var db= mongoose.connection;
var total=0;
var I=[];
//Create a shooping cart page and uses 'order' database 
router.get('/shoopingcart',function(req,res){
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

/*router.get('/firebasetest',function(req,res){
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
*/
// create edit form to edit book detail
router.post('/book/update_book/:id',function(req,res){   
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

//CREATE ID page to modify data with ID
router.get('/bookID',function(req,res){
    Book.find({},function(err,books){
        if(err){
            return err; 
        } else {
        res.render('bookID',{
            title:"PubHub ",
            books:books
        });
    }
    });
});
//create edit page to update book infomation
router.get('/edit',function(req,res){
    Book.find({},function(err,books){
        if(err){
            return err;
        } else {
        res.render('edit',{
            title:"PubHub ",
            books:books
        });
    }
    });
});
//uses id to get data
router.get('/book/:id',function(req,res){
        Book.findById(req.params.id, function(err, book){
            res.render('book',{
                title:'book detail',
                book:book,
           });
        });
    });
/*
router.get('/firebase/:id',function(req,res){
    Book.findById(req.params.id, function(err, book){
        res.render('book',{
            title:'book detail',
            book:book
        });
    });
})
*/
// uses order's id to list the detail of order in the web.
router.get('/order/:id',function(req,res){
    Order.findById(req.params.id, function(err, order){
        var price=order.price;
        res.render('order',{
            title:order.name,
            order:order
        });
    });
})
// create a page to find the record of order
router.get('/paypal/',function(req,res){
    Order.findById(req.params.id, function(err, orders){
        res.render('paypal',{
            title:"paypal order",
            orders:orders
        });
    });
})
//use Eidt key to edit book detail
router.get('/book/update_book/:id',function(req,res){
    Book.findById(req.params.id, function(err, books){
        res.render('update_book',{
            title:"Edit Book",
            books:books
        });
    });
})
// create add book page
router.get('/add',function(req,res){
    res.render('add_book',{
        title:'Add book'
    });
});

// create a adding form to add new book 
router.post('/add',function(req,res){   
    var book=new Book();
    book.barcode=req.body.barcode;
    book.name=req.body.name;
    book.price=req.body.price;
// save data to mongodb 
    book.save(function(err){
        if(err){
            return err;
        } else{
            req.flash('success');
            res.redirect('/');
        }
    });
});



// uses DELETE key to delete book
router.delete('/book/:id', function(req,res){
    var query={_id:req.params.id}
    Book.remove(query, function(err){
        if(err){
            return err;
        }
        res.send("deleted");
    });
});
// To calcualte the total price and create a shooping record.
router.get('/paypal/:id',function(req,res){
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

module.exports = router;
