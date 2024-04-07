<?php
class Route
{
    private $fullUrl;
    private $url;
    private $inComeData;

    public function __construct($usedUrl)
    {
        $this->fullUrl = $usedUrl;
        $this->url = explode('/', $this->fullUrl);
        $this->inComeData = json_decode(file_get_contents('php://input'), false);
    }

    public function urlRoute()
    {
        switch (end($this->url))
        {
            case "login":
                {
                    $data = new CarRent();
                    echo json_encode($data->Login($this->inComeData->username, $this->inComeData->pwd));
                    break;
                }
            case "allcar":
                {
                    $data = new CarRent();
                    echo json_encode($data->AllCar());
                    break;
                }
            case "categories":
                {
                    $data = new CarRent();
                    echo json_encode($data->Categories());
                    break;
                }
            case "availability":
                {
                    $data = new CarRent();
                    echo json_encode($data->Availability($this->inComeData->id));
                    break;
                }
            case "previousRentals":
                {
                    $data = new CarRent();
                    echo json_encode($data->PreviousRentals($this->inComeData->username));
                    break;
                }
            case "discounts":
                {
                    $data = new CarRent();
                    echo json_encode($data->Discounts());
                    break;
                }
            default:
                {
                    break;
                }
        }
    }
}
