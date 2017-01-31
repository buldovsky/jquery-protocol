/**
 * 
 * Прописываем протокол ошибок
 * 
 */
define(['./main'], function(){

    $.ajaxProtocol('message', { 

        success : function(data, status, jqXHR){
            
            // в переменной this содержится контекст вызова AJAX запроса к объекту
            var context = this

            // если в ответе не строка, нам пригодится эта функция
            var arr_to_str = function(data){

                return data.toString()

            }

            switch(data.status){
                case 'error' : 
                    
                    alert('Ошибка: ' + arr_to_str(data.error))
                    
                break
                case 'success' : 
                
                    alert('Успех: ' + arr_to_str(data.message)) 
                    
                break
                case 'notice' :
                
                    alert(arr_to_str(data.notice))
                    
                break
            }
            
        }            
    })
      
});