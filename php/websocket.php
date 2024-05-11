<?php

namespace Autorent;

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

require_once __DIR__ . "/../vendor/autoload.php";

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Discount()
        )
    ),
    8081
);

$server->run();
