<?php
    spl_autoload_register(function ($class) {
        include 'classes/' . $class . '.class.php';
    });
    $route=new Route($_SERVER["REQUEST_URI"]);
    $route->urlRoute();
?>