<?php

// Проверка обработка 500 ошибки
// header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);

$response = [
	'status' => true,
	'errors' => [],
];

if ($_POST['email'] === 'test@test.ru') {
	$response['status'] = false;
	$response['errors']['email'] = 'Пользователь с таким email уже зарегистрирован';
}


die(json_encode($response));