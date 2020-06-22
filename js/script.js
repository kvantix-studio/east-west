$(document).ready(function (){
    $('.calc-submit').click(function(){
        $.post(
            '/script/calc/bitrix24/lead_gen.php', 
             $("#calc-form").serialize(),

            function(msg) {
                
                $('.msg').html(msg);
            }
        );
        return false;
    });
});