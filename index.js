/* ========================================================================
 * Jquery Double Validate
 * https://github.com/north-leshiy/double-validate
 * ======================================================================== */

import $ from 'jquery';

var defaults = {
    urlHandler:                ''
    , params:                  {
        scrollToTopOnError: false,
        borderColorOnError: false,
        errorMessageClass:  'error',
        lang:               'ru'
    }
    , ajaxMethod:              document.location.host === 'localhost:8080' ? 'GET' : 'POST'
    , errorMessage:            'Спасибо за отправку формы!\n' +
                                   'Однако что-то пошло не так и мы не смогли получить данные.\n' +
                                   'Перезвоните нам или попробуйте отправить еще раз позже.'
    , errorMessageNetwork:     'Отсутствует соедиение с сайтом, проверьте соедиенение с интернетом ии попробуйте отправить позже'
    , classMainErrorContainer: 'double-validate__main-error-container'
    , classMainErrorItem:      'double-validate__main-error-item'
    , showErrorMessage:        true
    , reportErrorToListener:   false
    , urlErrorListener:        'https://error-listener.w6p.ru/'

    // callbacks
    , onBeforeSend:            function() {
    }
    , onServerValidateSuccess: function() {
    }
    , onServerValidateError:   function() {
    }
    , onBlockedForm:           function() {
    }
    , onUnBlockedForm:         function() {
    }
    , onErrorRequest:          function() {
    }
    , sendErrorToListener:     function(errorData, widget) {
        if (!widget.config.urlErrorListener) {
            return;
        }

        var formTextData = widget.$form.serialize();
        var requestInfo  = {
            formTextData: formTextData,
            responseCode: errorData.status,
            statusText:   errorData.statusText,
            readyState:   errorData.readyState,
            responseText: errorData.responseText
        };

        $.ajax({
            url:      widget.config.urlErrorListener,
            type:     'POST',
            dataType: 'json',
            data:     requestInfo
        });
    }

    // callback alias for compatibility
    , validateSuccess: function() {
    }
    , validateError:   function() {
    }
};

/**
 * DoubleValidate constructor
 */
var DoubleValidate = function($form, options) {
    var widget    = this;
    widget.config = $.extend(true, {}, defaults, options);
    widget.$form  = $form;

    /**
     * Обработка событий
     */
    $.each(widget.config, function(name, value) {
        if (typeof value === 'function') {
            widget.$form.on(name + '.doubleValidate', (function(event, data) {
                return value(data, widget);
            }))
        }
    });

    widget.init();
};

DoubleValidate.prototype = {
    /**
     * Конструктор
     * @return {void}
     */
    init: function() {
        var widget = this;

        widget.$form.on('submit', function(event) {
            event.preventDefault();
        });

        // Отключаем нативную валидацию
        widget.$form.attr('novalidate', 'novalidate');

        // Устанавливаем адрес обработчика
        if (widget.config.urlHandler === '') {
            widget.config.urlHandler = widget.$form.attr('action');
        }

        // Навешиваем обработку плагина validator
        var validateParams = {
            form:      '#' + widget.$form.attr('id'),
            onSuccess: function() {
                widget.ajaxHandler();
            }
        };
        validateParams     = $.extend(true, {}, validateParams, widget.config.params);

        $.validate(validateParams);
    },

    /**
     * Главный ajax handler
     * @return {void}
     */
    ajaxHandler: function() {
        var widget = this;

        if (widget.formBlocked) {
            console.error('Дублирующий ajax запрос');
            return;
        }

        widget.blockForm();

        var formData = new FormData(widget.$form.get()[0]);

        widget.$form.trigger('onBeforeSend.doubleValidate', [formData]);

        $.ajax({
                url:         widget.config.urlHandler,
                type:        widget.config.ajaxMethod,
                dataType:    'json',
                data:        formData,
                processData: false,
                contentType: false
            })
            .done(function(data) {
                widget.removeMainErrors();

                if (data.status) {
                    widget.$form.trigger('onServerValidateSuccess.doubleValidate', [data]);
                    widget.$form.trigger('validateSuccess.doubleValidate', [data]); // for compability
                } else {
                    widget.errorHandler(data);
                    widget.$form.trigger('onServerValidateError.doubleValidate', [data]);
                    widget.$form.trigger('validateError.doubleValidate', [data]); // for compability

                }
            })
            .fail(function(data) {
                if (data.status === 0 || data.readyState === 0) {
                    alert(widget.config.errorMessageNetwork);
                } else {
                    alert(widget.config.errorMessage);
                }

                if (widget.config.reportErrorToListener) {
                    widget.$form.trigger('sendErrorToListener.doubleValidate', [data]);
                }
            })
            .always(function() {
                widget.unBlockForm();
            });
    },

    /**
     * Обработчик ошибок пришедших с сервера
     * @param  {object} response ответ сервера
     * @param  {object.errors} response ответ сервера
     * @return {void}
     */
    errorHandler: function(response) {

        for (var el in response.errors) {
            this.$form.find('input[name="' + el + '"]')
                .addClass('error')
                .after('<span class="help-block error">' + response.errors[el] + '</span>');
        }

        if (response.mainErrors) {
            this.addMainErrors(response.mainErrors);
        } else {
            this.removeMainErrors();
        }

    },

    /**
     * Бокирование формы, для избежания отправки запросов
     * @return {void}
     */
    blockForm: function() {
        this.$form.addClass('double-validate--wait');
        this.$form.trigger('onBlockedForm.doubleValidate', [this.$form]);
        this.formBlocked = true;
    },

    /**
     * Разблокирование формы
     * @return {void}
     */
    unBlockForm: function() {
        this.formBlocked = false;
        this.$form.trigger('onUnBlockedForm.doubleValidate', [this.$form]);
        this.$form.removeClass('double-validate--wait');
    },

    /**
     * Добавление общих ошибок в контейнер
     * @param {array} mainErrors массив общих ошибок
     * @return {void}
     */
    addMainErrors: function(mainErrors) {
        var $container = $('.' + this.config.classMainErrorContainer);

        for (var i = mainErrors.length - 1; i >= 0; i--) {
            $('<div class="' + this.config.classMainErrorItem + '">' + mainErrors[i] + '</div>').appendTo($container);
        }
    },

    /**
     * Удаление общих ошибок
     * @return {void}
     */
    removeMainErrors: function() {
        $('.' + this.config.classMainErrorContainer).html('');
    }

};

$.fn.doubleValidate = function(options) {
    return new DoubleValidate(this.first(), options);
};
