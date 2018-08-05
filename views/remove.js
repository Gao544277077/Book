$(document).ready(function(){

    $('.delete-order').on('click',function(e){
        $target = $(e.target);
        const id =$target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url:'/books/order/'+id,
            success: function(response){
;               alert('succed to remove item');
                window.location.href='/books/shoopingcart';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});