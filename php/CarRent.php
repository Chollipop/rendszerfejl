<?php

namespace Autorent;

require_once __DIR__ . "/../vendor/autoload.php";

use Autorent\Entity\Car;
use Autorent\Entity\Category;
use Autorent\Entity\Rental;
use Autorent\Entity\Sale;
use Autorent\Entity\User;
use Doctrine\DBAL\Driver\IBMDB2\Driver;
use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Tools\Setup;
use Error;
use Doctrine\ORM\Tools\SchemaTool;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Dotenv\Dotenv;

class CarRent
{
    private $entityManager;
    private $qb;
    private $secretKey;

    public function __construct()
    {
        try
        {
            $dotenv = Dotenv::createImmutable(__DIR__);
            $dotenv->safeLoad();
            $this->secretKey = $_ENV["SECRET_KEY"];

            $connectionParams = [
                'dbname' => 'autorent',
                'user' => 'root',
                'password' => '',
                'host' => '127.0.0.1:3306',
                'driver' => 'pdo_mysql',
            ];

            $config = Setup::createAttributeMetadataConfiguration([__DIR__ . '/Entity', true]);
            $config->setAutoGenerateProxyClasses(true);

            $this->entityManager = EntityManager::create(
                $connectionParams,
                $config
            );
            $this->qb = $this->entityManager->createQueryBuilder();
        }
        catch (Error $e)
        {
            var_dump($e->getMessage());
        }
    }

    public function Login($username, $pwd)
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy(["username" => $username]);
        if ($user != null)
        {
            if (password_verify($pwd, $user->getPassword()))
            {

                $payload = [
                    "iss" => "localhost",
                    "aud" => "localhost",
                    "iat" => time(),
                    "nbf" => time(),
                    "exp" => time() + 3600,
                    "data" => [
                        "userId" => $user->getId(),
                        "username" => $user->getUsername(),
                        "authLevel" => $user->getRole()
                    ]
                ];

                $token = JWT::encode($payload, $this->secretKey, "HS256");
                setcookie("jwt", $token, time() + (86400 * 7), "/", "", true, false);
                return true;
            }
        }
        return false;
    }

    public function AllCar()
    {
        $cars = $this->entityManager->getRepository(Car::class)->findAll();

        $carsAssocArray = [];
        foreach ($cars as $c)
        {
            array_push($carsAssocArray, $c->asAssocArray());
        }
        return $carsAssocArray;
    }

    public function Categories()
    {
        $categories = $this->entityManager->getRepository(Category::class)->findAll();
        $categoriesAssocArray = [];
        foreach ($categories as $ctg)
        {
            array_push(
                $categoriesAssocArray,
                [
                    "id" => $ctg->getId(),
                    "name" => $ctg->getName()
                ]
            );
        }
        return $categoriesAssocArray;
    }

    public function Availability($id)
    {
        $query = $this->qb
            ->select("r")
            ->from(Rental::class, "r")
            ->where("r.car = ?1")
            ->setParameter(1, $id)
            ->getQuery();
        $result = $query->getResult();
        $rentalDates = [];

        foreach ($result as $r)
        {
            array_push($rentalDates, [$r->getFrom_date(), $r->getTo_date()]);
        }
        return $rentalDates;
    }

    public function PreviousRentals($userId)
    {
        $query = $this->qb
            ->select("r")
            ->from(Rental::class, "r")
            ->where("r.user = ?1")
            ->setParameter(1, $userId)
            ->getQuery();
        $result = $query->getResult();

        $rentals = [];
        foreach ($result as $r)
        {
            array_push($rentals, $r->asAssocArray());
        }
        return $rentals;
    }

    public function Discounts()
    {
        $sales = $this->entityManager->getRepository(Sale::class)->findAll();;
        $salesArray = [];

        foreach ($sales as $s)
        {
            array_push($salesArray, $s->asAssocArray());
        }
        return $salesArray;
    }

    public function Price($id)
    {
        $car = $this->entityManager->getRepository(Car::class)->findOneBy(["id" => $id]);
        $price = $car->getDaily_price();
        return $price;
    }

    public function RentCar($userId, $carId, $fromDate, $toDate, $created)
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy(["id" => $userId]);
        $car = $this->entityManager->getRepository(Car::class)->findOneBy(["id" => $carId]);
        if ($user == null || $car == null)
        {
            return;
        }

        $rental = new Rental();
        $rental->setUser($user);
        $rental->setCar($car);
        $rental->setFrom_date($fromDate);
        $rental->setTo_date($toDate);
        $rental->setCreated($created);

        $this->entityManager->persist($rental);
        $this->entityManager->flush();
        return;
    }

    public function CarsInCategory($category)
    {
        $query = $this->qb
            ->select("c")
            ->from(Car::class, "c")
            ->where("c.category = ?1")
            ->setParameter(1, $category)
            ->getQuery();
        $cars = $query->getResult();

        $carsAssocArray = [];
        foreach ($cars as $c)
        {
            array_push($carsAssocArray, $c->asAssocArray());
        }
        return $carsAssocArray;
    }

    public function AddCar($categoryId, $brand, $model, $daily_price)
    {
        $category = $this->entityManager->getRepository(Category::class)->findOneBy(["id" => $categoryId]);
        if ($category == null)
        {
            return;
        }

        $car = new Car();
        $car->setCategory($category);
        $car->setBrand($brand);
        $car->setModel($model);
        $car->setDaily_price($daily_price);

        $this->entityManager->persist($car);
        $this->entityManager->flush();
        return;
    }

    public function CreateDb()
    {
        $connectionParams = [
            'dbname' => '',
            'user' => 'root',
            'password' => '',
            'host' => '127.0.0.1:3306',
            'driver' => 'pdo_mysql',
        ];
        $conn = DriverManager::getConnection($connectionParams);

        $doesDbExist = $conn->fetchOne("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'autorent'");

        if (!$doesDbExist)
        {
            $createDb = $conn
                ->prepare("CREATE DATABASE IF NOT EXISTS autorent");
            $createDb->executeStatement();

            $conn = $this->entityManager->getConnection();

            $tool = new SchemaTool($this->entityManager);
            $classes = array(
                $this->entityManager->getClassMetadata(Car::class),
                $this->entityManager->getClassMetadata(Category::class),
                $this->entityManager->getClassMetadata(Rental::class),
                $this->entityManager->getClassMetadata(Sale::class),
                $this->entityManager->getClassMetadata(User::class),
            );
            $tool->updateSchema($classes);

            $category1 = new Category();
            $category1->setName("SUV");
            $this->entityManager->persist($category1);

            $category2 = new Category();
            $category2->setName("Sedan");
            $this->entityManager->persist($category2);

            $category3 = new Category();
            $category3->setName("Hatchback");
            $this->entityManager->persist($category3);

            $category4 = new Category();
            $category4->setName("Truck");
            $this->entityManager->persist($category4);

            $car1 = new Car();
            $car1->setCategory($category2);
            $car1->setBrand("Toyota");
            $car1->setModel("RAV4");
            $car1->setDaily_price(1000);
            $this->entityManager->persist($car1);

            $car2 = new Car();
            $car2->setCategory($category3);
            $car2->setBrand("Honda");
            $car2->setModel("Accord");
            $car2->setDaily_price(1200);
            $this->entityManager->persist($car2);

            $car3 = new Car();
            $car3->setCategory($category4);
            $car3->setBrand("Volkswagen");
            $car3->setModel("Golf");
            $car3->setDaily_price(1500);
            $this->entityManager->persist($car3);

            $car4 = new Car();
            $car4->setCategory($category1);
            $car4->setBrand("Ford");
            $car4->setModel("F-150");
            $car4->setDaily_price(2000);
            $this->entityManager->persist($car4);

            $car5 = new Car();
            $car5->setCategory($category2);
            $car5->setBrand("Toyota");
            $car5->setModel("is that a supra");
            $car5->setDaily_price(9999);
            $this->entityManager->persist($car5);

            $sale = new Sale();
            $sale->setCar($car4);
            $sale->setDescription("this is a very nice sale with very much big discount");
            $sale->setPercent(10);
            $this->entityManager->persist($sale);

            $user = new User();
            $user->setUsername("user");
            $user->setName("Szia Szevasz");
            $user->setPassword("user123");
            $user->setRole("user");
            $this->entityManager->persist($user);

            $user2 = new User();
            $user2->setUsername("admin");
            $user2->setName("Haló Szia");
            $user2->setPassword("admin123");
            $user2->setRole("admin");
            $this->entityManager->persist($user2);

            $this->entityManager->flush();
        }
    }
}
