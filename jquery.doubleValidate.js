/**
 * Двойная валидация v 0.1
 *
 * Набор процедур для автоматизации биндинга форм
 * с двойной валидацией (клиент + сервер)
 *
 * Использует плагин jquery.validate [jqueryvalidation.org]
 * 1. Для каждой формы добавляем класс .js-form
 * 2. Делаем вызов formHandler
 * 3. Для случаев кастомной обработки/логики добавляем свой колбек
 *    Важно: callback он не заменяет логику валидации
 *
 *
 * Серверный обработчик должен вернуть следующий JSON
 * | {
 * | 	  status: true/false
 * | 	, errors: {
 * | 		  fieldName1: strTypeField1Error
 * | 		, fieldName2: strTypeField2Error
 * | 		[...]
 * | 	}
 * | 	, successHtmlReplacement: html
 * | }
 *
 * status: bool успех/ошибка отправки/записи формы
 * successHtmlReplacement: html замена формы
 * fieldNameN: имя поля отправки, оно же input name
 * strTypeFieldNError: описание ошибки для данного поля
 *
 * Идентификатором формы является его поле name. Форме необходимо задать ID.
 * Путь к обработчику по умолчанию берется из action формы
 */
;(function($){

	var defaults = {
		  request: {}
		, urlHandler: ""
		, ajaxMethod: document.location.host === 'localhost:8080' ? 'GET' : 'POST'
		, errorText: "Спасибо за отправку формы!\n" +
					 "Однако что-то пошло не так и мы не смогли получить данные.\n"+
					 "Перезвоните нам или попробуйте отправить еще раз позже."
	};

	/**
	 * DoubleValidate constructor
	 */
	var DoubleValidate = function($form, options){
		var widget     = this;
		widget.config  = $.extend(true, {}, defaults, options);
		widget.$form   = $form;

		/**
		 * Обработка событий
		 */
		$.each(widget.config, function(name, value) {
			if (typeof value === 'function') {
				widget.$form.on(name + '.doubleValidate', (function(){
					return value(widget.$form);
				}))
			}
		});

		widget.init();
	}

	DoubleValidate.prototype = {
		init: function() {
			var widget = this;

			widget.$form.on('submit', function(event) {
				event.preventDefault();
			});

			/**
			 * Отключаем нативную валидацию
			 */
			widget.$form.attr('novalidate', 'novalidate');

			/**
			 * Устанавливаем адрес обработчика
			 */
			if (widget.config.urlHandler === "") {
				widget.config.urlHandler = widget.$form.attr('action');
			}

			/**
			 * Навешиваем обработку плагина validator
			 */
			$.validate({
				// modules : 'date, security, regexp',
				form: '#'+widget.$form.attr('id'),
				scrollToTopOnError: false,
				borderColorOnError: false,
				errorMessageClass: 'error',
				language: myLanguage,
				onSuccess: function(){
					widget.ajaxHandler();
				}
			});
		},

		ajaxHandler: function(){
			var widget      = this;
			var formRequest = widget.$form.serialize();
			var nameForm    = '&formId='+widget.$form.attr('name');
			formRequest    += nameForm;

			$.ajax({
				url: widget.config.urlHandler,
				type: widget.config.ajaxMethod,
				dataType: 'json',
				data: formRequest
			})
			.done(function(data) {
				if (data.status) {
					widget.$form.trigger('validateSuccess.doubleValidate');
					widget.$form.replaceWith($(data.successHtmlReplacement));
				}else{
					widget.errorHandler(data);
					widget.$form.trigger('validateError.doubleValidate');
				}
			})
			.fail(function() { alert(widget.config.errorText) })
			// .always(function() {console.log('always');});
		},

		errorHandler: function(data){
			var widget = this;
			// TODO: метод-враппер для обработки ошибок
		},

		addError: function(){
			var widget = this;
			// TODO: метод-который навесит ошибку на поле
		},

		removeError: function(){
			var widget = this;
			// TODO: метод который уберет ошибку с поля (need?)
		}

	}

	$.fn.doubleValidate = function(options){
		new DoubleValidate(this.first(),options);
		return this;
	}

}(jQuery));
