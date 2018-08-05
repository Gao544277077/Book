const functions = require('firebase-functions');

function sumbitClick(){
    var order = document.getElementById("order");
    var submitBtn = document.getElementById('submitBtn');
    var qty=order.value;
       var Order=firebase.database().ref();
         Item=Order.child('itemlist');
         Item.child('price').set(215);
         Item.child('name').set('aaa');
         Item.child('qty').set(qty);
}