/**
 * 
 * Прописываем протокол ошибок
 * 
 */
define(['./main'], function(){


    // если в ответе не строка, нам пригодится эта функция
    /*
    var arr_to_str = function(data){

        return data.toString()

    }
    */
        
	$(document).on('protocolMessageError', function(e, context, data, status, jqXHR){

        return [data.error]

        
	}).on('protocolMessageSuccess', function(e, context, data, status, jqXHR){

        return [data.message]

        
	}).on('protocolMessageNotice', function(e, context, data, status, jqXHR){

        return [data.notice]
        
    })
      
});