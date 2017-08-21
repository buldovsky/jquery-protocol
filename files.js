/**
 * 
 * Прописываем протокол Файлов
 *
 *
 * 
 */
define(['reqres-classes/modal', 'reqres-classes/field', 'angular-smart-bootstrap', './main'], function(ModalClass, FieldClass, app){


    /**
     *
     * Эта функция добавляет модалку в окно
     *
     * Все модалки (окна) будут храниться в элементе body с идентификатором modalContainerId
     * Каждая модалка (окно) будет привязана к контексту (DOM-элементу, который вызвал AJAX запрос)
     * В этом элементе и будет ссылка на модалку в data('objectmodal')
     *
     */

    // этот счетчик нужен нам чтобы создавать уникальный controllerId
	var count = 0
    
    $(document).on('protocolFiles', function(e, context, data, status, jqXHR, template){

        // в переменной this содержится контекст вызова AJAX запроса к объекту
        //var context = this

        // возвращая те или иные параметры, мы сможем их использовать в обработчике протокола
        var returnRes

        // создаем уникальную строку
        var controllerId = 'filesProtocol' + (count++) + 'Ctrl'



        // если от нашего элемента уже был вызван протокол объекта,
        // значит модалка уже создана и нам остается только обновить данные
        if(context.$scope){

            // обновляем данные                
            // переносим все данные в scope
            $.each(data.$data, function(i, value){ context.$scope[i] = value })
            // обновляем скоуп
            context.$scope.$apply()

        }





        switch(status){

            case 'list': 


                if(context.$scope) {

                    $.each(context.$scope.objects, function(oid, object){

                        // если выбран элемент, то скролим на него
                        if(object.ind()) object.activate()

                            })

                    return
                }

                // поскольку у нас ниже стоит require
                // как результат протокола вернется обещание
                // внутри require мы передадим в это обещение данные                
                returnRes = $.Deferred()

                var i = 0
                require(['reqres-classes/list'], function(ListClass){

                    var args = arguments
                    var newmodal = new ModalClass(context, template)

                    newmodal
                    	// при обновлении модалки заново выполняем запрос из протокола
                        .refresh(function(){ $.ajax(jqXHR.requestOptions) })
                    	// при закрытии модалки удаляем информацию из context
                        .hide(function(){ delete context.$scope; })
                    	// указываем контроллер
                        .get().attr('ng-controller', controllerId)



                    var lists = [] 

                    // передаем переменные в обработчик протокола
                    returnRes.resolveWith(context, [newmodal])

                    // добавляем контроллер
                    app().controller(controllerId, ['$scope', 'commonFactory', '$rootScope', '$templateCache'].concat([ 
                        function($scope, commonFactory, $rootScope, $templateCache) {

                            $.each(data.$dirs, function(did, arr){ 

                                var list = new ListClass(newmodal.get(), '.'+arr.classes.element_class) 
                                lists[did] = list
                                list.active('active', 'click')
                                list.contextmenu(arr.classes.context_class)
                                $scope.list = list

                            })

                            $scope.dirs = data.$dirs
                            // прописывем функцию поиска
                            $scope.mySearchHandler = function(value, index, array){

                                if(!$scope.search) return true
                                // прописываем функцию поиска
                                var check = function(val){ if(val.match(new RegExp($scope.search, "i"))) throw true; }
                                try {

                                    $.each(value, function(key, val){

                                        // не ищем в системных значениях
                                        if(key[0] == '_') return
                                        // сравниваем строки
                                        switch(typeof val){
                                            case "string": check(val); break
                                            case "object": 
                                            if(!val) return
                                            if('_text' in val) check(val._text)
                                            $.each(val, function(k, v){
                                                if(k[0] !== '_' && typeof v == "string") check(v)
                                                    })
                                            break
                                        }
                                    })

                                } catch(res){ return true }

                                return false

                            }

                            $scope.lists = lists

                            $scope.common = commonFactory
                            $scope.request = jqXHR.requestOptions
                            
                            // получаем список данных
                            angular.forEach(data.$data, function(value, key){ $scope[key] = value; })
                            // эта функция нам нужна чтобы заносить в кэш шаблоны и использовать
                            // их например для рекурсивной генерации кода (можно скриптом, но касперский блочит)
                            $scope.templateCache = function(tid, pattern){ $templateCache.put(tid, newmodal.get().find(pattern).html())  }
                            // сохраняем $scope, чтобы потом обновлять его
                            context.$scope = $scope
                            //
                            $scope.modal = newmodal



                            // обновляем все директивы компилируем код
                        }])).recompile(newmodal.get())

                    // передаем в контекст, что мы загрузились
                    //if(context instanceof FieldClass) context.setObject(newmodal, object)


                })

            break

            case 'row':              

                if(context.$scope) return;

                var newmodal = (new ModalClass(context, template))
                newmodal
                	// при обновлении модалки заново выполняем запрос из протокола
                    .refresh(function(){ $.ajax(jqXHR.requestOptions) })
                	// при закрытии модалки удаляем информацию из context
                    .hide(function(){ delete context.$scope; })
                	// указываем контроллер
                    .get().attr('ng-controller', controllerId)


                returnRes = [newmodal, context]

                // добавляем контроллеры директивы
                app().controller(controllerId, ['$scope', 'commonFactory', '$rootScope'].concat([ function($scope,commonFactory,$rootScope) {

                    $scope.common = commonFactory
                    $scope.request = jqXHR.requestOptions

                    context.$scope = $scope                    
                    $scope.object = context
                    $scope.modal = newmodal
                    // получаем список данных
                    angular.forEach(data.$data, function(value, key){ $scope[key] = value; })

                    // обновляем все директивы компилируем код
                }])).recompile(newmodal.get())


            break

                /*
            case 'form':     

                // поскольку у нас ниже стоит require
                // как результат протокола вернется обещание
				// внутри require мы передадим в это обещение данные                
				returnRes = $.Deferred()

                require(['reqres-classes/form', 'reqres-classes/object'], function(formClass, objectClass){

	                var formdata = data.$data.form_data || {};            

            		if(context.$scope) {

                        // нужно сверять стартовые значения формы с актуальными
                        // вдруг пока мы редактируем элемент его уже отредактировали
                        // нужно сообщить какие изменения произошли
                        if(context.$scope.form.startdata !== formdata){

                            // нужно проверять каждое значение по отдельности
                            //alert('Значения строки изменились')
                            // переопределяем 
                            //context.$scope.form.startdata = formdata
                        }

                        return

                    }


                    var newmodal = new ModalClass(context, template)
                    newmodal
                    	// при обновлении модалки заново выполняем запрос из протокола
                        .refresh(function(){ $.ajax(jqXHR.requestOptions) })
                    	// при закрытии модалки удаляем информацию из context
                    	.hide(function(){ delete context.$scope; })
                    	// указываем контроллер
                    	.get().attr('ng-controller', controllerId)


                    // смотрим данные для инициации формы
                    var forminit = data.jsFormObject || {};

                    var $form = $('form', newmodal.get())

                    formClass.around($form, 'init', forminit).detect(function(){

                        var Form = this

                        // сохраняем стартовые значения формы
                        Form.startdata = formdata


                        // сохраняем тот факт, что форма вызвана из объекта (списка)
                        if(context instanceof objectClass) Form.object(context)
                        //Form.modal = newmodal



                        app.controller(controllerId, function($scope, commonFactory, $rootScope) {

                            $scope.common = commonFactory
                            // сохраняем скоуп в контекст чтобы потом его менять
                            context.$scope = $scope
                            // прописываем все пришеджие переменные в scope
                            $.each(data.$data, function(key, value){ $scope[key] = value; })

                            // форму тоже прописываем
                            $scope.form = Form
                            // сохраняем список всех объектов
                            $scope.modal = newmodal

                            //if(Form.object) $scope.object = Form.object

                            var list
                            if(!data.$data.require) list = null
                            else list = (typeof data.$data.require == 'string') ? [ data.$data.require ] : data.$data.require;
							// загружаем список js модулей
                            require(list, function(){
								// выполняем каждый из них
                                angular.forEach(arguments, function(handler, key){
                                    handler.call(Form, formdata, newmodal, data.$js, $scope)
                                })
                                // после обработчика, заполняем форму данными
                                Form.values(formdata)

                                var focusField
                                // усли указано на каком окне фокусироваться
                                if(data.$js) if(data.$js.focusField) focusField = data.$js.focusField

                                if(context instanceof objectClass) if(context.activeField()) { focusField = context.activeField(); context.activeField(null) }

                                if(focusField) Form.detect(focusField, function(Field){ if(!Field) return; Field.focus() })

                                // передаем переменные в обработчик протокола
                                returnRes.resolveWith(context, [newmodal, Form])                                  

                            })

                        // обновляем все директивы компилируем код
                        }).recompile(newmodal.get())

                    })

                })

            break
			*/

        }

        // возвращаем данные чтобы можно было при вызове протокола 
        // сразу его использовать вместе с этими данными
        return returnRes

    })    
    
    
})    
