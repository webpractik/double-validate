# Jquery Double Validate
Плагин для двойной валидации (client+server). Содержит в себе унифицированный ajax+json запрос и умеет автоматически подставлять ошибки к конкретным полям.

## Установка:

```
bower install double-validate
```

## Parameters

**validateSuccess(reponse)** - callback вызывается после успешной отправки данных на сервер и получении status=true. Принимает в параметр reponse json ответ сервера.

**validateError(reponse)** - callback вызывается после успешной отправки данных на сервер и получении status=false. Принимает в параметр reponse json ответ сервера.

**params** - параметры в JqueryFormValidator. Перекрывает параметры по умолчанию.

**errorText** - текст для alert в случае невозможности послать ajax запрос (к примеру 500 сервера)

**urlHandler** - Адрес обработчика. По умолчанию берет текущий action="" из формы.

## Детали
* При отправке данных включает блокировку, не позволяя задублировать запрос до получения ответа. В этот момент на форму навешивается класс `.double-validate-wait`, для возможности дать визуальный фидбек юзверю.
* При получении 500, выведет примитивный alert с сообщением, которое можно заменить через параметр errorText
* Учитывает файлы при отправке формы

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
		validateSuccess: function(data){
			console.log('you request added');
		},
		validateError: function(data){
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
}
```
Работает на основе [jQuery Form Validator](https://github.com/victorjonsson/jQuery-Form-Validator).
Выбран он вместо стандартного jquery.validate.js из-за большей гибкости управления из html (нужна для кастомного комопонента bitrix).

