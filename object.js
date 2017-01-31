/**
 * 
 * Прописываем протокол Объектов
 *
 * Этот протокол обрабатывает данные которы генерирует на сервере модуль Object
 *
 * 
 */
define(['reqres-classes/modal', 'reqres-classes/field', 'angular-default', './main'], function(ModalClass, FieldClass, angularModule){
/// !!!recompile

    // эта фабрика аозволяет на передавать данные 
    // между разными контроллерами
    angularModule.factory('objectUnionFactory', function(){
        
        return {
            
            xxx : 'Text'
            
        }
        
    })
    
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
    
    $.ajaxProtocol('object', {

        success : function(data, status, jqXHR, template){ 

            // в переменной this содержится контекст вызова AJAX запроса к объекту
            var context = this
            
            // создаем уникальную строку
			var controllerId = 'objectProtocol' + (count++) + 'Ctrl'
            
            
            // если модалка уже создана
            if(context.$scope){

                // обновляем данные                
                // переносим все данные в scope
                $.each(data.$data, function(i, value){ context.$scope[i] = value })
				// обновляем скоуп
                context.$scope.$apply()
                
            }
            
            
            
            
            
            switch(data.type){
                    
            case 'object-list': 

            	if(context.$scope) return;
                
                // здесь будут названия классов объектов
                var object_classes = []
                // допускается что может быть несколько объектов
                // добавляем название класса в объект подгрузки
                $.each(data.$objects, function(oid, object_data){ object_classes.push(object_data.objectclass || 'reqres-classes/object'); })
                    
                var i = 0
                require(object_classes, function(){

                    var args = arguments
                    var newmodal = new ModalClass(context, template)
                    
                    newmodal
                    	// при обновлении модалки заново выполняем запрос из протокола
                        .refresh(function(){ $.ajax(jqXHR.requestOptions) })
                    	// при закрытии модалки удаляем информацию из context
                    	.hide(function(){ delete context.$scope; })
                    	// указываем контроллер
                    	.get().attr('ng-controller', controllerId)

                    
                    var object, objects = {}, i = 0
                    
                    // допускается что может быть несколько объектов
                    $.each(data.$objects, function(oid, object_data){
                        
                        var objectClass = args[i++]
                        // создаем класс объекта используя те данные, что пришли
						// сохраняем все объекты в один массив
                        object = objects[oid] = new objectClass(newmodal.get(), object_data)
                        
                    })

                    
                    // добавляем контроллер
                    angularModule.controller(controllerId, ['$scope', 'objectUnionFactory', '$rootScope', '$templateCache'].concat([ function($scope, objectUnionFactory, $rootScope, $templateCache) {
						/*
                        $scope.activeRow = function(row){
                            if(!row) return $scope.row
                            $scope.row = row
                        }
                        */
                        $scope.union = objectUnionFactory                        
                        // получаем список данных
                        angular.forEach(data.$data, function(value, key){ $scope[key] = value; })
                        // эта функция нам нужна чтобы заносить в кэш шаблоны и использовать
                        // их например для рекурсивной генерации кода (можно скриптом, но касперский блочит)
                        $scope.templateCache = function(tid, pattern){ $templateCache.put(tid, $(pattern).html())  }
                        // сохраняем $scope, чтобы потом обновлять его
                        context.$scope = $scope
                        // сохраняем список всех объектов
                        $scope.objects = objects
                        // сохраняем список всех объектов
                        $scope.modal = newmodal



                        $.each(objects, function(oid, obj){

                            obj.$objscope = $scope
                            // сохраняем последний объект как единственный
                            $scope.object = obj
                            $scope.request = obj.request
                            // сохраняем последнее контекстное меню как единственное
                            $scope.objects[oid].request = obj.request
                            $scope.objects[oid].getrequest = obj.getrequest
                            $scope.objects[oid].contextmenu = data.$objects[oid].contextmenu


                            $scope.query = function(url, args){

                                $.ajax({

                                    url: url.replace(/\[\:([a-z0-9_-]+)\]/g, function(found, val){ return (val in args) ? args[val] : found }),
                                    // передаем протокол в контекст
                                    context: obj

                                })
                            }
							
                            /*                            
                            $scope.objects[oid].query = (function(object){ 

                                return function(url, args){

                                    $.ajax({

                                        url: url.replace(/\[\:([a-z0-9_-]+)\]/g, function(found, val){ return (val in args) ? args[val] : found }),
                                        // передаем протокол в контекст
                                        context: object

                                    })
                                }

                            })(obj)
                            
                            */

                        })

                    // обновляем все директивы компилируем код
                    }])).recompile(newmodal.get())
                    
                    // передаем в контекст, что мы загрузились
                    if(context instanceof FieldClass) context.setObject(newmodal, object)
                    
                    
                })
                    
            break
            
            case 'object-row':              

            	if(context.$scope) return;
                    
                var newmodal = (new ModalClass(context, template))
                newmodal
                	// при обновлении модалки заново выполняем запрос из протокола
                    .refresh(function(){ $.ajax(jqXHR.requestOptions) })
                	// при закрытии модалки удаляем информацию из context
                    .hide(function(){ delete context.$scope; })
                	// указываем контроллер
                    .get().attr('ng-controller', controllerId)

                   
                // добавляем контроллеры директивы
                angularModule.controller(controllerId, ['$scope', 'objectUnionFactory', '$rootScope'].concat([ function($scope,objectUnionFactory,$rootScope) {

                    $scope.union = objectUnionFactory
                    
                    context.$scope = $scope                    
                    $scope.object = context
                    $scope.modal = newmodal
                    // получаем список данных
                    angular.forEach(data.$data, function(value, key){ $scope[key] = value; })

                // обновляем все директивы компилируем код
                }])).recompile(newmodal.get())

                
            break

            case 'object-form':     
            

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
                        if(context instanceof objectClass) Form.object = context
                        //Form.modal = newmodal
                        
                        angularModule.controller(controllerId, function($scope, objectUnionFactory, $rootScope) {

                            $scope.union = objectUnionFactory
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

                            require(list, function(){

                                angular.forEach(arguments, function(handler, key){
                                    handler.call(Form, formdata, newmodal, data.$data, $scope)
                                })
                                // после обработчика, заполняем форму данными
                                Form.values(formdata)

                                var focusField
                                // усли указано на каком окне фокусироваться
                                if(data.$js) if(data.$js.focusField) focusField = data.$js.focusField
                                
                                if(context instanceof objectClass) if(context.activeField()) { focusField = context.activeField(); context.activeField(null) }
                                
                                if(focusField) Form.detect(focusField, function(Field){ if(!Field) return; Field.focus() })
                                
                            })

                        // обновляем все директивы компилируем код
                        }).recompile(newmodal.get())
                        
                    })
                    
                })
                
            break

            
            }

        }

    })    
    
    
})    
