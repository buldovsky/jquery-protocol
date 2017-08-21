/**
 * 
 * Прописываем протокол Объектов
 *
 * Этот протокол обрабатывает данные которы генерирует на сервере модуль Object
 *
 * 
 */
define(['angular-smart-bootstrap', 'reqres-classes/modal', 'reqres-classes/field', 'reqres-classes/list', './main', 'reqres-fields/field-phone'], 
       function(app, ModalClass, FieldClass, ListClass){

    
    /**
     *
     * создается модальное окно
     *
     */
    $(document).on('protocolObjectModal', function(e, context, data, status, jqXHR, template){


        // если уже создан контроллер то пропускаем этот шаг
        // потому что контроллер создается либо сам по себе либо из этого протокола
        if('$$watchers' in context) return;
        if(context.$scope) return;

        
		// создаем одноразовую модалку
        var Modal = (new ModalClass(context, template))
            // при закрытии модалки удаляем информацию из context
            .hide(function(){ delete context.$scope; })

        
        // с модалкой надо обязательно создать контроллер
        return $(document).triggerHandler('protocolObjectController', [ context, Modal, data, status, jqXHR ]) // .get()
        
		/*
        // инициируем объекты
        return $.when($(document).triggerHandler('protocolObjectInit', [ context, Modal.get(), data ])).then(function(scopeData){ 
            // с модалкой надо обязательно создать контроллер
            return $(document).triggerHandler('protocolObjectController', [ context, Modal.get(), scopeData, data, jqXHR ])
        
        })

        
    /**
     *
     * создается controller
     *
     */
    }).on('protocolObjectController', function(e, context, Modal, data, status, jqXHR){


	    // этот счетчик нужен нам чтобы создавать уникальный controllerId
		var count = 0
 		var controllerId = 'objectProtocol' + (count++) + 'Ctrl'
        
        Modal.get().attr('ng-controller', controllerId)

        // добавляем контроллер
        app(false).controller(controllerId, ['$scope', 'commonFactory', '$timeout', 
        function($scope, commonFactory, $timeout) {

            // сохраняем $scope, чтобы потом обновлять его
            context.$scope = $scope

            // получаем список данных
            angular.forEach(data.$data, function(value, key){ $scope[key] = value; })


            // !!! избавиться
            var x
            $scope.fixTreeList = function(e){
                if(!x) { $timeout(function(){ e.component.refresh()  }, 50); x = true; }
            }
            $scope.rowInserting = function(e){
            	if(e.rowType !== 'data') return
                $(e.rowElement).addClass(data.$data.lists.units.classes.element)
            }
            $scope.onSelect = function(e){
                $scope.List.row = e.selectedRowsData[0]
            }
            
            $scope.$t = $timeout							// эту функцию мы сохраняем чтоюы потом дожидатьзя загрузки элементов в ДОМ
            $scope.common = commonFactory                   // это для обновления запрса, там алиас ajax
            $scope.requestOptions = jqXHR.requestOptions	// это тоже для обновления
            $scope.eval = function(str){ eval(str) }		// это используетсяв контекстном шаблоне
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


            // так как мы из модалки создаем контроллер сохраняем и модалку
            $scope.Modal = Modal

                
        // обновляем все директивы компилируем код
        }]) 
        
        app(Modal.get().get(0))

		
        return [context, data, status, jqXHR, Modal, true]
        

        
    /**
     *
     * инициализируются классы
     *
     */
    }).on('protocolObjectList', function(e, context, data, status, jqXHR, element, firstTime){

        // в контексте всегда должен быть скоуп
        // если мы через модалку заходим сюда он там появляется, если через готовый контроллер там его нужно прописать

        
        if('$$watchers' in context) var $scope = context
        else {
            
            
            if(!context.$scope) { alert('В контексте дожен быть прописан $scope'); return }
        	var $scope = context.$scope
            
        }

        
        // разбираемся с модалкой (есть ли она)
        var Modal
        if('Modal' in $scope) if($scope.Modal instanceof ModalClass) {
            Modal = $scope.Modal
            element = Modal.get()
        }
        
        // если элемент не пришел, получаем его из скопа
        // то есть контроллер создан вручную и там свой элемент
        if(typeof element != 'object') element = $scope.element;

        // обновляем данные
        angular.forEach(data.$data, function(value, key){ 
        
            $scope[key] = value; 
        
        })

        if(!$scope.mmm){
            $scope.mmm = 0
            // всякий раз будем обновлять окно
            $scope.$watch('mmm', function(){ 
                // жеский хак используем функцию $timeout
                // чтобы дождаться загрузки элементов
                $scope.$t(function(){ 
                    $scope.List.refresh() 
                })
                
            });
        }
        
        
        $scope.mmm += 1
        // если мы уже инициализировали все списки, уходим
        if($scope.mmm > 1) {
            $scope.$apply()
            return [$scope.List, $scope.Modal] 
        }

        
        //var returnRes = $.Deferred()
        // здесь будут названия классов объектов
        //var require_array = []
        //var i = require_array.length
        
        // допускается что может быть несколько объектов
        // добавляем название класса в объект подгрузки
        //$.each(data.$objects, function(oid, object_data){ 
        //    require_array.push(object_data.objectclass || 'reqres-classes/object');
        //})
        //require(require_array, function(){

        
        // в следующий раз, когда эта модалка откроется заново, мы обновим запрос
        if(Modal) Modal.refresh(function(){ $scope.common.send(jqXHR.requestOptions) })

        
        $scope.Lists = $scope.objects = {};
        
        // допускается что может быть несколько объектов
        $.each(data.$data.lists, function(list_id, settings){


            // создаем класс списка
            var list = new ListClass(element, settings)
			// если мы вызваны из под поля
            if(context instanceof FieldClass) {
                list.select(function(e){

                    //возвращаем значение в поле
                    context.val({ _rid:list.row._rid , _text:list.row._text  })
                    // закрываем модалку если она есть
                    if(Modal) Modal.hide()
                    return true
                    
                })
			}
                
            list.activation('click')
            	// добавляем функцию нахождения строки по уникальному коду
            	.index(function(index){ return this.get().filter('[data-ind='+index+']') })
                //.contextmenu(settings.classes.context_class)
            	.on('dblclick', function(e){
                
                	// в контекст сохраняем поле, которе кликнули
                	list.activeField = $(e.target).add( $(e.target).parentsUntil(settings.patterns.element) )
                        .filter('[data-field]').first().data('field')
                    
            	})
                .active(function(e, active, last){

                    $(last).removeClass('active')
                    $(active).addClass('active')

                    // событие активации к нам может придти не только с ангуляра
                    // по этому на всякий случай вы полняем ангуляровкое событие
                    // это событие в шаблоне прописано
                    angular.element(active.get(0)).triggerHandler('click');

                })
              	// событие активации к нам может придти не только с ангуляра
                // поэтому на всякий случай вы полняем ангуляровкое событие это событие в шаблоне прописано
            	//.on('activate', function(elem){ angular.element(elem.get(0)).triggerHandler('click'); })
            
            

			// сохраняем эти данные только для того чтобы иметь обратную совместимость
            $scope.obj = $scope.objects[list_id] = data.$objects[list_id]
            // если в настройках объекта указана иерархичность
            if($scope.obj.ierarhy){
                
                // выполняем протокол иерархии
                $(document).triggerHandler('protocolObjectIerarhy', [ list, context, element, $scope.obj.ierarhy ])
                
            }
            
			$scope.obj.rid = function(){ return list.row._rid }

            $scope.List = $scope.Lists[list_id] = list
            $scope.request = function(url, args){

                $.ajax({
                    // подставляем значения в строке запроса
                    url: url.replace(/\[\:([a-z0-9_-]+)\]/g, function(found, val){ return (val in args) ? args[val] : found }),
                    // передаем протокол в контекст
                    context: list

                })
            }

        })

        
        $scope.$apply()
        return [$scope.List, $scope.Modal]
            
			//$scope.objects = {}
            //var obj, args = arguments
            
            /*
            $.each(data.$objects, function(oid, settings){
                
                var objectClass = args[i++]
                // создаем класс объекта используя те данные, что пришли
                obj = new objectClass(element.get(), settings)
                obj.listClass($scope.Lists[oid])

				$scope.objects[oid] = obj
                $scope.obj = obj

                
            })
			*/

            // передаем в контекст, что мы загрузились
            //if(context instanceof FieldClass) context.setObject(element, obj)

		//})
                
        


    /**
     *
     * иерархические объекты
     *
     */        
    }).on('protocolObjectIerarhy', function(e, List, context, element, ioptions){ // , data, status, jqXHR, element
        
        var $scope = context.$scope
        /**
         *
         * Получаем список дочерних элементов в иерархическом объекте исходя из настроек
         *
         */
        $scope.getChildren = function(rows, row){

            switch(ioptions.type){
                case 'al' :

                    var res = []
                    
                    $.each(rows, function(rid, eachrow){

                        var id = (row === undefined || row[ioptions.id] === ioptions.root_value) ? null : row[ioptions.id] 
                        if(eachrow[ioptions.parent_id] !== id) return 
                        res.push(eachrow)

                    })

                    return res

                break
            }

        }
        

    }).on('protocolObjectForm', function(e, context, data, status, jqXHR, element){                


        var formdata = data.$data.form_data || {};            

        /*
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
        */
        var def = $.Deferred()
        
        var $scope = context.$scope

        var Modal
        if(element instanceof ModalClass) {
            $scope.Modal = Modal = element
            element = element.get()
        }
        //if(element.hasClass('modal')) $scope.Modal = 
        // поскольку у нас ниже стоит require
        // как результат протокола вернется обещание
        // внутри require мы передадим в это обещение данные                
        //var returnRes = $.Deferred()

        require(['reqres-classes/form', 'reqres-classes/list'], function(formClass, ListClass){

            
            // смотрим данные для инициации формы
            var forminit = data.jsFormObject || {};

            var $form = $('form', element.get())

            
            
            formClass.around($form, 'init', forminit).detect(function(){

                var Form = this
                
                def.resolveWith(context, [Form, Modal])
                
                // сохраняем стартовые значения формы
                Form.startdata = formdata

                // сохраняем тот факт, что форма вызвана из объекта (списка)
                if(context instanceof ListClass) {
                    
                    // для этой формы добавляем обработчик
                    Form.submit(function(ajax){
                        
                        return ajax.on('protocolFormSuccess', function(e, Form, formresult){

                            // при обновлении списка назначаем событие 1 раз
                            if('last_index' in formresult) context.refresh(function(){
                                
	                            // устанавливаем курсор на позиции обязательно переводим в строку
                                context.active( formresult.last_index.toString() ).scroll()
                                
                            }, true)

                        })
                    })
                    
                }

                // сохраняем скоуп в контекст чтобы потом его менять
                context.$scope = $scope
                // прописываем все пришеджие переменные в scope
                $.each(data.$data, function(key, value){ $scope[key] = value; })

                // форму тоже прописываем
                $scope.Form = Form

                var list
                // иногда может быть указан обработчик формы
                if(!data.$data.require) list = null
                else list = (typeof data.$data.require == 'string') ? [ data.$data.require ] : data.$data.require;
                // загружаем список js модулей
                require(list, function(){
                    // выполняем каждый из них
                    angular.forEach(arguments, function(handler, key){
                        handler.call(Form, formdata, Modal, data.$js, $scope)
                    })
                    // после обработчика, заполняем форму данными
                    Form.values(formdata)

                    var focusField
                    // усли указано на каком окне фокусироваться
                    if(data.$js) if(data.$js.focusField) focusField = data.$js.focusField

                    if('activeField' in context) { focusField = context.activeField; }

                    if(focusField) Form.detect(focusField, function(Field){ if(!Field) return; Field.focus() })

                    // передаем переменные в обработчик протокола
                    //returnRes.resolveWith(context, [newmodal, Form])                                  

                })

            })

        })

        return def
        // возвращаем данные чтобы можно было при вызове протокола 
        // сразу его использовать вместе с этими данными
        //return returnRes
        
        
        
    }).on('protocolObjectRow', function(e, context, data, status, jqXHR, template){


        var $scope = context.$scope        
        //var = returnRes = [newmodal, context]

        $scope.object = context
        
        //$scope.modal = newmodal
        // получаем список данных
        angular.forEach(data.$data, function(value, key){ $scope[key] = value; })
        
        context.$scope.$apply()
        
        
        
    /**
     *
     * инициализируются классы
     *
     */
    }).on('protocolObjectList55', function(e, context, data, status, jqXHR, template){



                            // возвращая те или иные параметры, мы сможем их использовать в обработчике протокола
                            var returnRes



                            // добавляем контроллер
                            app.controller(controllerId, ['$scope', 'commonFactory', '$rootScope', '$templateCache'].concat([ 
                                function($scope, commonFactory, $rootScope, $templateCache) {


                                    // обновляем все директивы компилируем код
                                }]))        
                            /*
                            if(!template){

                                // если от нашего элемента уже был вызван протокол объекта,
                                // значит модалка уже создана и нам остается только обновить данные
                                if(context.$scope){

                                    // обновляем данные                
                                    // переносим все данные в scope
                                    $.each(data.$data, function(i, value){ context.$scope[i] = value })
                                    // обновляем скоуп
                                    context.$scope.$apply()

                                }

                            } else {

                                // создаем уникальную строку
                                var controllerId = 'objectProtocol' + (count++) + 'Ctrl'

                                if(status == 'modal'){



                                }

                            }
                            */      
                            //switch(status){

                                //case 'list': 

                                //var controllerId = 'objectProtocol' + (count++) + 'Ctrl'


                                    if(context.$scope){

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

                                    // здесь будут названия классов объектов
                                    var object_classes = []
                                    // допускается что может быть несколько объектов
                                    // добавляем название класса в объект подгрузки
                                    $.each(data.$objects, function(oid, object_data){ object_classes.push(object_data.objectclass || 'reqres-classes/object'); })

                                    object_classes.push('reqres-fields/field-phone')
                                    var i = 0
                                    require(object_classes, function(){

                                        var args = arguments

                                        /*
                                        var newmodal = new ModalClass(context, template)

                                        newmodal
                                            // при обновлении модалки заново выполняем запрос из протокола
                                            //.refresh(function(){ $.ajax(jqXHR.requestOptions) })
                                            // при закрытии модалки удаляем информацию из context
                                            .hide(function(){ delete context.$scope; })
                                            // указываем контроллер
                                            .get().attr('ng-controller', controllerId)
                                        */

                                        var object, objects = {}, i = 0

                                        // допускается что может быть несколько объектов
                                        $.each(data.$objects, function(oid, object_data){

                                            var objectClass = args[i++]
                                            // создаем класс объекта используя те данные, что пришли
                                            // сохраняем все объекты в один массив
                                            object = objects[oid] = new objectClass(newmodal.get(), object_data)

                                        })

                                        // передаем переменные в обработчик протокола
                                        returnRes.resolveWith(context, [newmodal, object])

                    // добавляем контроллер
                    angularModule.controller(controllerId, ['$scope', 'commonFactory', '$rootScope', '$templateCache'].concat([ 
                        function($scope, commonFactory, $rootScope, $templateCache) {

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

                                                                $scope.common = commonFactory                        
                                                                $scope.requestOptions = jqXHR.requestOptions
                                                                // сохраняем $scope, чтобы потом обновлять его
                                                                context.$scope = $scope


                                                                // получаем список данных
                                                                angular.forEach(data.$data, function(value, key){ $scope[key] = value; })
                                                                // эта функция нам нужна чтобы заносить в кэш шаблоны и использовать
                                                                // их например для рекурсивной генерации кода (можно скриптом, но касперский блочит)
                            								$scope.templateCache = function(tid, pattern){ $templateCache.put(tid, newmodal.get().find(pattern).html())  }
                                                            // сохраняем список всех объектов
                                                            $scope.objects = objects
                                                            // сохраняем список всех объектов
                                                            $scope.modal = newmodal



                                                        $.each(objects, function(oid, obj){

                                                            obj.$objscope = $scope
                                                            // сохраняем последний объект как единственный
                                                            $scope.object = obj
                                                            $scope.list = obj
                                                            $scope.request = obj.request
                                                            // сохраняем последнее контекстное меню как единственное
                                                            $scope.objects[oid].request = obj.request
                                                            $scope.objects[oid].getrequest = obj.getrequest
                                                            $scope.objects[oid].contextmenu = data.$objects[oid].contextmenu

                                                            $scope.eval = function(str){ eval(str) }

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

                
        return returnRes
        return arguments


    })    
    
    
})    
