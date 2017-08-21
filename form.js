/**
 * 
 * Прописываем протокол обработки Reqres JS форм (reqres-classes/form)
 * 
 */
define(['./main'], function(){

    
	$(document).on('protocolFormError', function(e, Form, data, status, jqXHR){ 
        
        // отображаем ошибки формы
        Form.errors(data.errors)

        return [Form, data]
        
	})
    .on('protocolFormSuccess', function(e, Form, data, status, jqXHR){ 

        // убираем все ошибки
        Form.errors(false)
        
        return [Form, data]

    })
})