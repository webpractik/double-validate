# Jquery Double Validate
Плагин для двойной валидации (client+server). Содержит в себе унифицированный ajax+json запрос и умеет автоматически подставлять ошибки к конкретным полям.

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

