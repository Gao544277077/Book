$(document).ready(function(){
    
    $('.delete-order').on('click',function(e){
        $target = $(e.target);
        const id =$target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url:'/order/'+id,
            success: function(response){
;               alert('succed to remove item');
                window.location.href='/shoopingcart';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});