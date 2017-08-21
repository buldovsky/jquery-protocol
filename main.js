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

    var nAjax = $.ajax
    
    // переписываем функцию
    $.ajax = function(){
        
        // выполняем стандартный Ajax с пришедшими аргументами
        var nativeAjax = nAjax.apply(this, arguments)
        //
        nativeAjax.protocolPrimise = $.Deferred()
        
        // поскольку после вызова аякса обычно на него навешиваются всякие обработчики
        // мы возвращаем не аякс а наше обещание, которое сработает после проверки на протокол
        var when = $.when( nativeAjax, nativeAjax.protocolPrimise )
            .then(function(){
            
            	//console.log('Выполнился эмулятор аякса, возвращаем данные аякса')
                return nativeAjax.protocolPrimise

            })

        when.on = function(){
            
            $.fn.on.apply($(nativeAjax), arguments)
            return when
            
        }
		return when       
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

		//d.promise()
        var sent_jqXHR = jqXHR
        
        // теперь когда мы этот аякс все таки получили
        jqXHR.always(function(data, status, jqXHR){

            // иногда может направильно произойти парсинг
            // в этом ничего страшного нет, так как мы порой ожидаем один тип данных,
            // а протокол нам возвращает другой
            if(status == "parsererror"){
                
                // запрос приходит первым аргументом
				jqXHR = data
                data = jqXHR.responseText
                
                // в этом случае выполняется обработчик ajaxSetup.error
                // !!! нужно, чтобы не выполнялся
                
            }

            
            var requirecond
            
            // в глобальных настройках ajax может быть установлено имя заголовка передающего id шаблона
            if('ajaxTemplateIdHeader' in $.ajaxSettings) {
                // получаем имя шаблона
                var templateId = jqXHR.getResponseHeader($.ajaxSettings.ajaxTemplateIdHeader)
                if(templateId) requirecond = 'text!' + templateId
            }

            // подгружаем шаблон
            require([requirecond], function(tpl){

                // в глобальных настройках ajax может быть установлено имя заголовка передающего id протокола
                if(('ajaxProtocolIdHeader' in $.ajaxSettings)){

                    // смотрим протокол в запросе
                    var pid = jqXHR.getResponseHeader($.ajaxSettings.ajaxProtocolIdHeader)
                    
                }

                // если не сработало ни одного обработчика
                // то есть по сути протокол не определен
                // потому-что все протоколы чтолибо возвращают хоть false
                if(!pid){
                    
                    // если мы не нашли такого протокола или он не указан
                    // выполняем наши внутрениие заранее подсунутые заголовки
                    // выполняем это значит что они отработают так как будно и не было никаких телодвижений
                    // завершаем эту свистопляску
                    jqXHR.ajaxProtocolPromice1.resolveWith(ajaxOptions.context).then(function(){ 

                    	jqXHR.protocolPrimise.resolveWith(ajaxOptions.context, [data, status, jqXHR, tpl]); 
                    
                    })
                    
                } else {

					var protocolStatus = []
                    // смотрим статус протокола
                    pid = pid.split(',')
                    if(pid.length > 1) { protocolStatus = pid.slice(1); pid = pid[0]; }
                    
                    // отбрасываем стандартные обраьотчики
                    jqXHR.protocolPrimise.reject()
                    jqXHR.ajaxProtocolPromice1.reject()
                    
                    
                    // выполняем событие протокола
					var currentResult //= [ajaxOptions.context, data, protocolStatus, jqXHR, tpl] //= result
                    
                    // проходимся по всем статусам
                    $.each(protocolStatus, function(i, stat){

                        if(currentResult === undefined) currentResult = [ajaxOptions.context, data, protocolStatus, jqXHR, tpl]
                        currentResult = $(document).triggerHandler('protocol' + pid + stat, currentResult)

                        // если протокол вернул Deferred
                        if(typeof currentResult == 'object') if('resolveWith' in currentResult && 'then' in currentResult){

                            // после выполнения обещания
                            return currentResult.then(function(){

                                // принимаем аргументы и передаем их в первичный обработчик
                                $(jqXHR).triggerHandler('protocol' + pid + stat, arguments)

                            });
                            
                        }
                            
                        
                        $(jqXHR).triggerHandler('protocol' + pid + stat, currentResult)
                        
                    })

                    if(protocolStatus.length == 0){
						var result = $(document).triggerHandler('protocol' + pid, [ajaxOptions.context, data, protocolStatus, jqXHR, tpl])
                    }
                        

                    var result = currentResult
                    
                    // если протокол вернул Deferred
                    if(typeof currentResult == 'object') if('resolveWith' in result && 'then' in result)
                        // после выполнения обещания
                        return result.then(function(){

                            // принимаем аргументы и передаем их в первичный обработчик
                            $(jqXHR).triggerHandler('protocol' + pid, arguments)

                        });
                    
                    $(jqXHR).triggerHandler('protocol' + pid, $.isArray(result) ? result : [result])
                    
                }
                
            })
            
        })

    })
    
    
})(jQuery)
