/**
 * 
 * Прописываем протокол обработки Reqres JS форм (reqres-classes/form)
 * 
 */
define(['./main'], function(){

    $.ajaxProtocol('form', {

        success : function(data, status, jqXHR){ 

            // в переменной this содержится контекст вызова AJAX запроса к объекту
            var Form = this

            switch(data.status){
                case 'error' : 
                    
                    // отображаем ошибки формы
                    Form.errors(data.errors)
                    
                break
                case 'success' : 

                	// эта строчка значит мы продолжаем 
                	// выполняем стандартные обработчики запроса
                	return data;
                    
                break
            }

        }
    })
})