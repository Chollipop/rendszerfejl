<?php

namespace Autorent;

require_once __DIR__ . "/../vendor/autoload.php";

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$route = new Route($_SERVER["REQUEST_URI"]);
$route->urlRoute();
