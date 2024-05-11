<?php

namespace Autorent;

require_once __DIR__ . "/../vendor/autoload.php";

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Discount implements MessageComponentInterface
{
    protected $clients;
    private $carRent;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
        $this->carRent = new CarRent();
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
        $discounts = $this->carRent->Discounts();
        $conn->send(json_encode($discounts));
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $data = json_decode($msg);
        $result = $this->carRent->AddDiscount($data->car, $data->description, $data->percent);
        if ($result !== false)
        {
            foreach ($this->clients as $client)
            {
                $client->send(json_encode($result));
            }
        }
        else
        {
            $from->send(json_encode($result));
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        $conn->close();
    }
}
