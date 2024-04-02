<?php

    class CarRent extends DataBaseConnection{

        public function Login($user,$passwd)
        {
           return;
        }
        public function AllCar() {
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

            $testData= [
                [
                    "catName" => "SUV",
                    "brand" => "Toyota",
                    "model" => "RAV4",
                    "price" => 60
                ],
                [
                    "catName" => "Sedan",
                    "brand" => "Honda",
                    "model" => "Accord",
                    "price" => 50
                ],
                [
                    "catName" => "Hatchback",
                    "brand" => "Volkswagen",
                    "model" => "Golf",
                    "price" => 45
                ],
                [
                    "catName" => "Truck",
                    "brand" => "Ford",
                    "model" => "F-150",
                    "price" => 70
                ]
            ]; 

            return $testData;
            
        }
}

?>