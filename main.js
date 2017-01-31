/**
 *
 * jQuery Ajax Plugin - ajaxProtocol v0.1.0
 * http://github.com/bumax/jquery-ajax-protocol.js
 * 
 * Copyright 2016, Max Buldovsky
 * This content is released under the MIT license
 *
 */
(function($){

    // добавляем функцию для прописания протоколов
    // с помощью этой функции мы теперь можем добавялить любое количество протоколов
    var protocols = {}
    $.ajaxProtocol = function(pid, settings){

        // если протокол с таким id уже прописан, то повторно его не создаем
        if(pid in protocols) return protocols[pid]
        // сохраняем протокол
	    protocols[pid] = settings
		// возвращаем для гибкости вдруг кому пригодится
        return protocols[pid]
        
    }

    // пересохраняем нативную функцию
    $.nativeAjax = $.ajax
    
    // переписываем функцию
    $.ajax = function(){
        
        var nativeAjax = $.nativeAjax.apply(this, arguments)
        nativeAjax.ajaxProtocolPromice2 = $.Deferred()
        
        // поскольку после вызова аякса обычно на него навешиваются всякие обработчики
        // мы возвращаем не аякс а наше обещание, которое сработает после проверки на протокол
        return $.when( nativeAjax, nativeAjax.ajaxProtocolPromice2 )
            .then(function(){
            
            	//console.log('Выполнился эмулятор аякса, возвращаем данные аякса')
                return nativeAjax.ajaxProtocolPromice2

            })

    }


    // эти события будем блокировать на время, для всех запросов
    var list = { success: 1, error: 1, complete: 1 }

  
    // прописываем префильтер для всех запросов
    // она временно нейтрализует обработчики запроса прописанные в ajax
    // таким образом у нас сейчас ни один обработчик ни одного запроса не сработает
    // пока мы не укажем что событие заложенное нами в каждый запрос выполнено
    $.ajaxPrefilter(function ( setupOptions, requestOptions, jqXHR ) {

        //console.log('ajaxPrefilter', arguments)        
        // сюда будем сохранять оригинальные обработчики
        // для каждого запроса
        var setupList = {}
        
        //var dt = jqXHR.dataType
        //setupOptions.dataType = 'text'
        
        // в каждом аякс запросе сохраняем деферед
        // то есть в каждом аякс запрос еэсто отложенный обработчик
        
        //console.log('Запросу придаем deferred-свойство ajaxProtocolPromice')            
        jqXHR.ajaxProtocolPromice1 = $.Deferred()
        jqXHR.requestOptions = requestOptions
        
        // пербираем все текущие обработчики запроса
        // с целью их переопределить на время
        for (var i in list) (function(i){

            // сохраняем оригинальный обработчик
            setupList[i] = setupOptions[i]
			
            //console.log('Запросу подменяем обработчик-глобальную настройку '+i)            
            // переприсваиваем обработчики, заменяя их на себя же, только с отсрочкой
            setupOptions[i] = function(){ 

                // сохраняем контекст и аргументы обработчика
                var context = this
                var args = arguments

                // обещаем что при выполненн нашего отложенного события
                // мы выполним все обработчики как следует
                jqXHR.ajaxProtocolPromice1.promise().done(function(){

		            //console.log('Выполняем обработчик-глобальную настройку '+i)            
                    // выполнятся обработчики с нужным контекстом и аргументами
                    if(typeof setupList[i] == 'function') 
                        setupList[i].apply(context, args)

                })

                // после выполнения обработчика будем возвращать себя
                // то есть аякс запрос
                return context
            }

        })(i)
        
    });    


    

    // прописываем обработчик глобального события
    // при отправке любого запроса
    $(document).bind("ajaxSend", function(event, jqXHR, ajaxOptions){

        //console.log('ajaxSend', arguments)
/*
        // создаем отложеное событие
        var d = $.Deferred()
        
        //console.log(event, jqXHR, ajaxOptions)
        // сюда будем сохранять оригинальные обработчики
        // для каждого запроса        
        var requestList = {}
        // перебираем все основные события
        // мы собираемся их переопределить
        for (var i in list) (function(ii){

			console.log('Запросу подменяем обработчик-свойство '+ii)
            // сохраняем оригинальные обработчики запроса
            requestList[ii] = jqXHR[ii]
            // переприсваем обработчики, заменяя их на себя же, только с отсрочкой
            jqXHR[ii] = function(){

                // сохраняем контекст и аргументы обработчика
                var context = this
                var args = arguments

                d.promise()
                	// если сбудется наше самописное событие
                	// то выполним оригинальное
                	// и вернем все на место что наворошили
                    .done(function(){

						console.log('Запросу выполняем обработчик-свойство '+ii)
                        requestList[ii].apply(context, args)

						console.log('Запросу возвращаем обработчик-свойство '+ii)
                        // возвращаем исходные значения
                        jqXHR[ii] = requestList[ii]


                    })
                    // если не сбудется наше самописное событие
                	// то не выполнем оригинальное а только вернем все наместо
                    .fail(function(){

						console.log('Запросу возвращаем обработчик-свойство '+ii)
                        // возвращаем исходные значения
                        jqXHR[ii] = requestList[ii]

                    })

                return context

            }

        })(i)
*/

		//d.promise()
        
        // теперь когда мы этот аякс все таки получили
        jqXHR.always(function(data, status, jqXHR2){

            // иногда может направильно произойти парсинг
            // в этом ничего страшного нет, так как мы порой ожидаем один тип данных,
            // а протокол нам возвращает другой
            if(status == "parsererror"){
                
				jqXHR2 = data
                data = jqXHR2.responseText
                
                // в этом случае выполняется обработчик ajaxSetup.error
                // !!! нужно, чтобы не выполнялся
                
            }

            
            var ok, requirecond
            
            // в глобальных настройках ajax может быть установлено имя заголовка передающего id шаблона
            if('ajaxTemplateIdHeader' in $.ajaxSettings) {
                // получаем имя шаблона
                
                var templateId = jqXHR2.getResponseHeader($.ajaxSettings.ajaxTemplateIdHeader)
                if(templateId) requirecond = 'text!' + templateId
            }

            // подгружаем шаблон
            require([requirecond], function(tpl){

                // в глобальных настройках ajax может быть установлено имя заголовка передающего id протокола
                if(('ajaxProtocolIdHeader' in $.ajaxSettings)){

                    // смотрим протокол в запросе
                    var pid = jqXHR2.getResponseHeader($.ajaxSettings.ajaxProtocolIdHeader)

                    //console.log(!pid ? 'Протокол в ответе не найден' : 'Найден Протокол в ответе ' + pid + '. Протокол ' + (pid in protocols ? '' : 'не ') + 'существует')            
                    
                    // если такой есть то хорошо
					if(pid in protocols)  ok = true
                    
                }
                
                
                // выполянем обработчик протокола
                if(typeof protocols[pid].success == 'function'){
                    
                	var result = protocols[pid].success.call(ajaxOptions.context, data, status, jqXHR2, tpl)
                    
                    // здесь мы кстати можем анализировать ответ
                    // и в зависимости от ответа уже работаем
                    if(!result){} else ok = false
                    
                }                

                // в параметрах запроса может быть прописана функция-условие для срабатывания протокола
                // вне зависимости от заголовка
                //if(typeof s.cond == 'function') ok = s.cond.call(this, data, status, jqXHR2, tpl)

                // если мы не нашли такого протокола или он не указан
                // выполняем наши внутрениие заранее подсунутые заголовки
                // выполняем это значит что они отработают так как будно и не было никаких телодвижений
                // завершаем эту свистопляску
                if(ok !== true){
                    
					//console.log('Протокол не определен')                         
                    jqXHR2.ajaxProtocolPromice1.resolveWith(ajaxOptions.context).then(function(){ 
                        
                    	//d.resolve(data, status, jqXHR2, tpl); 
                    	jqXHR2.ajaxProtocolPromice2.resolveWith(ajaxOptions.context, [data, status, jqXHR2, tpl, result]); 
                    
                    })
                    
                } else {
                    
                    jqXHR2.ajaxProtocolPromice2.reject()
                    jqXHR2.ajaxProtocolPromice1.reject()
                    
                }
                

				// ну а если мы определились с протоколом
                // тогда нам нужно забыть про стандартные методы
                //console.log('Стандартные методы не выполнятся')                         
                //d.reject()
                

                

                    


            })
            
        })

    })
    
    
})(jQuery)
