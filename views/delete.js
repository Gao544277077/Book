$(document).ready(function(){
    $('.delete-book').on('click',function(e){
        $target = $(e.target);
        const id =$target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url:'/books/book/'+id,
            success: function(response){
                alert('succed to delete book');
                window.location.href='/';
            },
            error: function(err){
                console.log(err);
            }
        });
    });
});