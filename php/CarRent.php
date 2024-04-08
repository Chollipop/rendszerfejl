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

class CarRent
{
    private $entityManager;
    private $qb;

    public function __construct()
    {
        try
        {
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
        if (password_verify($pwd, $user->getPassword()))
        {
            return true;
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


        if (!$conn->prepare("SELECT * FROM category")->executeQuery()->fetchNumeric())
        {
            $conn->prepare("
                INSERT INTO `category` (`id`, `name`) VALUES
                (2, 'SUV'),
                (3, 'Sedan'),
                (4, 'Hatchback'),
                (5, 'Truck');")
                ->executeStatement();
        }

        if (!$conn->prepare("SELECT * FROM cars")->executeQuery()->fetchNumeric())
        {
            $conn->prepare("
                INSERT INTO `cars` (`id`, `category_id`, `brand`, `model`, `daily_price`) VALUES
                (4, 2, 'Toyota', 'RAV4', 1000),
                (5, 3, 'Honda', 'Accord', 1200),
                (6, 4, 'Volkswagen', 'Golf', 1500),
                (7, 5, 'Ford', 'F-150', 2000),
                (8, 2, 'Toyota', 'is that a supra', 9999);")
                ->executeStatement();
        }

        if (!$conn->prepare("SELECT * FROM sales")->executeQuery()->fetchNumeric())
        {
            $conn->prepare("
                INSERT INTO `sales` (`id`, `car_id`, `description`, `percent`) VALUES
                (1, 7, 'this is a very nice sale with very much big discount', 10);")
                ->executeStatement();
        }

        if (!$conn->prepare("SELECT * FROM users")->executeQuery()->fetchNumeric())
        {
            $conn->prepare("
                INSERT INTO `users` (`id`, `username`, `name`, `password`) VALUES
                (2, 'user', 'Szia Szevasz', '\$2y\$10\$a25ZCv85ZYBRXB9et3Br3OnDRYuJUdtoXRD1bgK9dly8rgeN41GXu');")
                ->executeStatement();
        }
    }
}
