<?php

namespace Autorent;

require_once __DIR__ . "/../vendor/autoload.php";

$route = new Route($_SERVER["REQUEST_URI"]);
$route->urlRoute();
