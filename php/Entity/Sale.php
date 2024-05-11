<?php

namespace Autorent\Entity;

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
#[Table('sales')]
class Sale
{
    #[Id]
    #[Column, GeneratedValue]
    private int $id;

    #[OneToOne(targetEntity: Car::class)]
    #[JoinColumn(name: 'car_id', referencedColumnName: 'id')]
    private Car $car;

    #[Column]
    private string $description;

    #[Column]
    private int $percent;

    public function getId(): int
    {
        return $this->id;
    }

    public function getCar(): Car
    {
        return $this->car;
    }

    public function setCar(Car $car)
    {
        $this->car = $car;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function getPercent(): int
    {
        return $this->percent;
    }

    public function setPercent(int $percent)
    {
        $this->percent = $percent;
    }

    public function asAssocArray(): array
    {
        $array = [
            "id" => $this->getId(),
            "car_Id" => $this->getCar()->getId(),
            "catName" => $this->getCar()->getCategory()->getName(),
            "brand" => $this->getCar()->getBrand(),
            "model" => $this->getCar()->getModel(),
            "price" => $this->getCar()->getDaily_price(),
            "description" => $this->getDescription(),
            "percent" => $this->getPercent()
        ];
        return $array;
    }
}
