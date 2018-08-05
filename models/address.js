var mongoose =require('mongoose');
var addressSchema= mongoose.Schema({
    

    address:{
        type:String,
        required:true
    },

});

var address=module.exports =mongoose.model("Address",amountSchema);