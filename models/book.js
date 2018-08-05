var mongoose =require('mongoose');
var bookSchema= mongoose.Schema({
    barcode:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
});

var Book=module.exports =mongoose.model("Book",bookSchema);