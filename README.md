# Jquery Double Validate
Плагин для двойной валидации (client+server). Содержит в себе унифицированный ajax+json запрос и умеет автоматически подставлять ошибки к конкретным полям.

## Установка:

```
bower install double-validate
```

## Parameters

Name | Desc | Default
------------ | ------------- | -------------
**params** | Параметры транслируемые в JqueryFormValidator. Перекрывает параметры по умолчанию. | `{scrollToTopOnError: false, borderColorOnError: false, errorMessageClass: 'error', lang: 'ru', }`
**urlHandler** | Адрес обработчика данной формы. |  Берет текущий `action` из формы.
**showErrorMessage** | Показывать ли alert при неуспешной попытке послать данные на сервер | true
**errorMessage** | Текст для alert при неуспешной попытке послать данные на сервер (к примеру 5хх ответ сервера, отсутствие интернета). | "Спасибо за отправку формы! Однако что-то пошло не так и мы не смогли получить данные. Перезвоните нам или попробуйте отправить еще раз "позже."
**reportErrorToListener** | Посылать ли данные об ошибки внешнему фиксатору. Нужно для личных нужд мониторинга работы форм. | false
**urlErrorListener** | Посылать ли данные об ошибки внешнему фиксатору. Нужно для личных нужд мониторинга работы форм. | null
**classMainErrorContainer** | Класс контейнера куда будут складываться общие ошибки | 'double-validate__main-error-container'
**classMainErrorItem** | Класс элемента в который будет обернут элемент общей ошибки | 'double-validate__main-error-item'

## Callbacks
Name | Desc
------------ | -------------
**onServerValidateSuccess** | Вызывается после успешной отправки данных на сервер и получении status=true. Принимает в параметр reponse json ответ сервера.
**onServerValidateError** | Вызывается после успешной отправки данных на сервер и получении status=false. Принимает в параметр reponse json ответ сервера.
**onBlockedForm** | Вызывается при блокировке формы перед отправкой данных на сервер. Принимает в параметр Jquery выборку текущей формы.
**onUnBlockedForm** | Вызывается после разблокировки формы. Принимает в параметр Jquery выборку текущей формы.
**onErrorRequest** | Вызывается при ошибке отправки формы. Принимает параметры запроса.


## Детали
* При отправке данных включает блокировку, не позволяя задублировать запрос до получения ответа. В этот момент на форму навешивается класс `.double-validate--wait`, для возможности дать визуальный фидбек юзверю.
* При ошибке отправки запроса, или не получении в ответет корректного json, выведет примитивный alert с сообщением, которое можно заменить через параметр errorText
* Учитывает файлы при отправке формы
* Есть общие ошибки которые нет возможности логически привязать к какому либо полю, они передаются через отдельное свойство объекта ответа сервера. Они размещаются в отдельном контейнере, классами которые можно управлять через свойства.
* Есть возможность послать на внешний сервер при ошибке отправки формы для внутренней системы алертов

## Example
```html
<form id="form" action="/ajax/formHandler.php">
	<input type="email" value="" placeholder="Email" required
		data-validation-error-msg-required="Поле, обязательно к заполнению"
		data-validation="required">

	<input type="text" value="" placeholder="Телефон" required
		data-validation-error-msg-required="Поле, обязательно к заполнению"
		data-validation="required">
</form>

<script src="js/jquery.min.js"></script>
<script src="js/jquery.form-validator.min.js"></script>
<script src="js/jquery.double-validate.js"></script>
<script>
	$('#form').doubleValidate({
		onServerValidateSuccess: function(data){
			console.log('you request added');
		},
		onServerValidateError: function(data){
			console.log('error');
		}
	});
</script>
```

## Унифицированный ответ сервера:
```json
{
	  "status": true
	, "errors": {
		  "email": "Пользователь с таким email уже существует"
		, "company": "Для регистрации в качестве оптового покупателя необходимо заполнить это поле"
		[...]
	}
	, "mainErrors": [
		"Вы уже отправили заявку"
	]
}
```
Работает на основе [jQuery Form Validator](https://github.com/victorjonsson/jQuery-Form-Validator).
Выбран он вместо стандартного jquery.validate.js из-за большей гибкости управления из html, что проще в поддержке на ряде движков.