/* ========================================================================
 * Jquery Double Validate v0.0.3
 * https://github.com/north-leshiy/double-validate
 * ======================================================================== */
 (function($){

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
			
			var widget   = this;
			var idForm   = widget.$form.attr('id');
			var formData = new FormData( widget.$form.get()[0] );

			if ( $('#'+idForm).find('input[type="file"]').length > 0 ) {
				formData.append('file', $('input[type="file"]')[0].files[0]);
			}

			$.ajax({
				url: widget.config.urlHandler,
				type: widget.config.ajaxMethod,
				dataType: 'json',
				data: formData,
				processData: false,
				contentType: false
			})
			
			.done(function(data) {

				if (data.status) {
					widget.$form.trigger('validateSuccess.doubleValidate',data);
				}else{
					widget.errorHandler(data);
					widget.$form.trigger('validateError.doubleValidate',data);
				}
			})
			.fail(function() { alert(widget.config.errorText) })
			// .always(function() {console.log('always');});
		},

		errorHandler: function(data){
			var widget = this;
			// метод-враппер для обработки ошибок

			for (var el in data.errors) {
				widget.$form.find('input[name="'+el+'"]')
					.addClass('error')
					.after('<span class="help-block error">'+data.errors[el]+'</span>');
			}

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
