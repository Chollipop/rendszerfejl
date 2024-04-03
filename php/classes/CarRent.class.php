<?php

class CarRent extends DataBaseConnection
{

    public function Login($user, $passwd)
    {
        return;
    }
    public function AllCar()
    {
        /*
            $command="SELECT category.name as catNamenev,
            cars.brand as brand,
            cars.model as model,
            cars.Daily_price as price
            FROM cars
            INNER JOIN category 
            on cars.category_id=category.id";
            $osszes=$this->DataFetch($command);
            */

        $testData = [
            [
                "id" => 1,
                "catName" => "SUV",
                "brand" => "Toyota",
                "model" => "RAV4",
                "price" => 60
            ],
            [
                "id" => 2,
                "catName" => "Sedan",
                "brand" => "Honda",
                "model" => "Accord",
                "price" => 50
            ],
            [
                "id" => 3,
                "catName" => "Hatchback",
                "brand" => "Volkswagen",
                "model" => "Golf",
                "price" => 45
            ],
            [
                "id" => 4,
                "catName" => "Truck",
                "brand" => "Ford",
                "model" => "F-150",
                "price" => 70
            ]
        ];

        return $testData;
    }
    public function Categories()
    {
        $testData = [
            [
                "id" => 1,
                "catName" => "SUV",
                "brand" => "Toyota",
                "model" => "RAV4",
                "price" => 60
            ],
            [
                "id" => 2,
                "catName" => "Sedan",
                "brand" => "Honda",
                "model" => "Accord",
                "price" => 50
            ],
            [
                "id" => 3,
                "catName" => "Hatchback",
                "brand" => "Volkswagen",
                "model" => "Golf",
                "price" => 45
            ],
            [
                "id" => 4,
                "catName" => "Truck",
                "brand" => "Ford",
                "model" => "F-150",
                "price" => 70
            ]
        ];

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
                "to_date" => "2024-04-24",
                "daily_price" => 1000
            ]
        ];

        $date = [];
        array_push($date, $testData[$id - 1]["from_date"], $testData[$id - 1]["to_date"], $testData[$id - 1]["daily_price"]);

        return $date;
    }
}
