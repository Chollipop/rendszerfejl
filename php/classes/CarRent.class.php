<?php

class CarRent extends DataBaseConnection
{

    public function Login($username, $pwd)
    {
        if ($username == "user" && $pwd == "user123")
        {
            return true;
        }
        return false;
    }
    public function AllCar()
    {
        $testData = [
            [
                "id" => 1,
                "catName" => "SUV",
                "brand" => "Toyota",
                "model" => "RAV4",
                "price" => 1000,
                "discount" => 0
            ],
            [
                "id" => 2,
                "catName" => "Sedan",
                "brand" => "Honda",
                "model" => "Accord",
                "price" => 1000,
                "discount" => 0
            ],
            [
                "id" => 3,
                "catName" => "Hatchback",
                "brand" => "Volkswagen",
                "model" => "Golf",
                "price" => 1000,
                "discount" => 0
            ],
            [
                "id" => 4,
                "catName" => "Truck",
                "brand" => "Ford",
                "model" => "F-150",
                "price" => 1000,
                "discount" => 10
            ]
        ];

        return $testData;
    }
    public function Categories()
    {
        $testData = ["SUV", "Sedan", "Hatchback", "Truck"];

        return $testData;
    }

    public function Availability($id)
    {
        $testData = [
            [
                "id" => 1,
                "from_date" => "2024-04-15",
                "to_date" => "2024-04-20",
                "daily_price" => 1000
            ],
            [
                "id" => 2,
                "from_date" => "2024-03-15",
                "to_date" => "2024-04-01",
                "daily_price" => 1000
            ],
            [
                "id" => 3,
                "from_date" => "2024-03-15",
                "to_date" => "2024-03-19",
                "daily_price" => 1000
            ],
            [
                "id" => 4,
                "from_date" => "2024-04-15",
                "to_date" => "2024-04-16",
                "daily_price" => 1000
            ]
        ];

        $date = [];
        array_push($date, $testData[$id - 1]["from_date"], $testData[$id - 1]["to_date"], $testData[$id - 1]["daily_price"]);

        return $date;
    }

    public function PreviousRentals($username)
    {
        $testData = [
            [
                "id" => 4,
                "catName" => "Truck",
                "brand" => "Ford",
                "model" => "F-150",
                "daily_price" => 1000,
                "from_date" => "2024-04-15",
                "to_date" => "2024-04-16",
            ]
        ];

        return $testData;
    }

    public function Discounts()
    {
        $testData = [
            [
                "id" => 4,
                "catName" => "Truck",
                "brand" => "Ford",
                "model" => "F-150",
                "price" => 1000,
                "percent" => 10,
            ]
        ];

        return $testData;
    }
}
