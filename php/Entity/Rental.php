<?php

namespace Autorent\Entity;

use DateTime;
use Doctrine\ORM\Mapping\Entity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping\Column;
use Doctrine\ORM\Mapping\GeneratedValue;
use Doctrine\ORM\Mapping\Id;
use Doctrine\ORM\Mapping\OneToOne;
use Doctrine\ORM\Mapping\ManyToOne;
use Doctrine\ORM\Mapping\OneToMany;
use Doctrine\ORM\Mapping\ManyToMany;
use Doctrine\ORM\Mapping\Table;

#[Entity]
#[Table('rentals')]
class Rental
{
    #[Id]
    #[Column, GeneratedValue]
    private int $id;

    #[ManyToOne(targetEntity: User::class)]
    #[JoinColumn(name: 'user_id', referencedColumnName: 'id')]
    private User $user;

    #[ManyToOne(targetEntity: Car::class)]
    #[JoinColumn(name: 'car_id', referencedColumnName: 'id')]
    private Car $car;

    #[Column]
    private DateTime $from_date;

    #[Column]
    private DateTime $to_date;

    #[Column]
    private DateTime $created;

    public function getId(): int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
    }

    public function getCar(): Car
    {
        return $this->car;
    }

    public function setCar(Car $car)
    {
        $this->car = $car;
    }

    public function getFrom_date(): DateTime
    {
        return $this->from_date;
    }

    public function setFrom_date(string $from_date)
    {
        $this->from_date = DateTime::createFromFormat('Y m d', $from_date);
    }

    public function getTo_date(): DateTime
    {
        return $this->to_date;
    }

    public function setTo_date(string $to_date)
    {
        $this->to_date = DateTime::createFromFormat('Y m d', $to_date);
    }

    public function getCreated(): DateTime
    {
        return $this->created;
    }

    public function setCreated(string $created)
    {
        $this->created = DateTime::createFromFormat('Y m d', $created);
        $this->created->setTimezone(new \DateTimeZone("Europe/Brussels"));
    }

    public function asAssocArray(): array
    {
        $array = [
            "id" => $this->getId(),
            "user_id" => $this->getUser()->getId(),
            "car_id" => $this->getCar()->getId(),
            "name" => $this->getCar()->getCategory()->getName(),
            "brand" => $this->getCar()->getBrand(),
            "model" => $this->getCar()->getModel(),
            "daily_price" => $this->getCar()->getDaily_price(),
            "from_date" => $this->getFrom_date(),
            "to_date" => $this->getTo_date(),
            "created" => $this->getCreated()
        ];
        return $array;
    }
}
