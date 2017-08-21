/**
 * 
 * Прописываем протокол авторизации
 * 
 */
define(['./main'], function(Form){

	$(document).on('protocolAuth', function(e, context, response, status, jqXHR){    
        

        if(typeof response == 'string'){

            if($('.mod_auth_modal').length > 0) return

            // в даныных приходит страница авторизации
            var div = $('<div>').appendTo('body').append($(response))
            // находим в ответе модальное окно и вставляем его на страницу
            var modal = div.find('.modal').appendTo('body').data('embeded', true) //.modal('show')

            var moduleid = 'auth' //div.find('body').attr('data-require')

            div.remove()

            // выполняем скрипт авторизации
            require([ moduleid ], function(handler){ handler() })

        }

        // мы прошли авторизацию
        if(typeof response == 'object'){

            var info = response.info
            var modal = $('.mod_auth_modal')

            // если модалка была вставлена скриптом
            if(modal.data('embeded')){

                // убираем ее
                modal.off('hide.bs.modal').on('hidden.bs.modal', function(){ $(this).remove() }).modal('hide')

                // можно попробовать отработать тот аякс который мы прервали когда перехватили авторизацию

            } else {

                // иначе обновляем страницу
                window.location.reload()

            }

        }


    })
});
