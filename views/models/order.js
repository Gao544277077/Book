var mongoose =require('mongoose');
var orderSchema= mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },

});

var Order=module.exports =mongoose.model("Order",orderSchema);