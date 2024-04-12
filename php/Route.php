<?php

namespace Autorent;

use Error;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;
use Dotenv\Dotenv;

require_once __DIR__ . "/../vendor/autoload.php";

class Route
{
    private $fullUrl;
    private $url;
    private $inComeData;
    private $secretKey;
    private $authHeader;
    private $decoded;

    public function __construct($usedUrl)
    {
        $dotenv = Dotenv::createImmutable(__DIR__);
        $dotenv->safeLoad();
        $this->secretKey = $_ENV["SECRET_KEY"];

        $this->fullUrl = $usedUrl;
        $this->url = explode('/', $this->fullUrl);
        $this->inComeData = json_decode(file_get_contents('php://input'), false);

        $this->authHeader = $_COOKIE["jwt"] ?? null;
        $this->decoded = null;
        try
        {
            error_reporting(1);
            $this->decoded = JWT::decode($this->authHeader, new Key($this->secretKey, 'HS256'));
        }
        catch (\Throwable $e)
        {
            error_reporting(0);
        }
    }

    public function urlRoute()
    {
        switch (end($this->url))
        {
            case "login":
                {
                    if ($this->decoded == null)
                    {
                        $data = new CarRent();
                        echo json_encode($data->Login($this->inComeData->username, $this->inComeData->pwd));
                    }
                    else
                    {
                        setcookie("jwt", $this->authHeader, time() + (86400 * 7), "/", "", true, false);
                        echo true;
                    }
                    break;
                }
            case "allcar":
                {
                    if ($this->decoded->data->authLevel == "user")
                    {
                        $data = new CarRent();
                        echo json_encode($data->AllCar());
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "categories":
                {
                    if ($this->decoded->data->authLevel == "user" || $this->decoded->data->authLevel == "admin")
                    {
                        $data = new CarRent();
                        echo json_encode($data->Categories());
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "availability":
                {
                    if ($this->decoded->data->authLevel == "user")
                    {
                        $data = new CarRent();
                        echo json_encode($data->Availability($this->inComeData->id));
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "previousRentals":
                {
                    if ($this->decoded->data->authLevel == "user")
                    {
                        $data = new CarRent();
                        echo json_encode($data->PreviousRentals($this->decoded->data->userId));
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "discounts":
                {
                    if ($this->decoded->data->authLevel == "user")
                    {
                        $data = new CarRent();
                        echo json_encode($data->Discounts());
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "rent":
                {
                    if ($this->decoded->data->authLevel == "user")
                    {
                        $data = new CarRent();
                        echo json_encode($data->RentCar(
                            $this->decoded->data->userId,
                            $this->inComeData->carId,
                            $this->inComeData->fromDate,
                            $this->inComeData->toDate,
                            $this->inComeData->created
                        ));
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "price":
                {
                    if ($this->decoded->data->authLevel == "user")
                    {
                        $data = new CarRent();
                        echo json_encode($data->Price($this->inComeData->id));
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "createDb":
                {
                    $data = new CarRent();
                    echo json_encode($data->CreateDb());
                    break;
                }
            case "carsincategory":
                {
                    if ($this->decoded->data->authLevel == "user")
                    {
                        $data = new CarRent();
                        echo json_encode($data->CarsInCategory($this->inComeData->category));
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            case "addcar":
                {
                    if ($this->decoded->data->authLevel == "admin")
                    {
                        $data = new CarRent();
                        echo json_encode($data->AddCar(
                            $this->inComeData->category,
                            $this->inComeData->brand,
                            $this->inComeData->model,
                            $this->inComeData->daily_price
                        ));
                    }
                    else
                    {
                        header("HTTP/1.1 401 Unauthorized");
                    }
                    break;
                }
            default:
                {
                    header("HTTP/1.1 404 Not Found");
                    break;
                }
        }
    }
}
