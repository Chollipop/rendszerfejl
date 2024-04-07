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
#[Table('cars')]
class Car
{
    #[Id]
    #[Column, GeneratedValue]
    private int $id;

    #[ManyToOne(targetEntity: Category::class)]
    #[JoinColumn(name: 'category_id', referencedColumnName: 'id')]
    private Category $category;

    #[Column]
    private string $brand;

    #[Column]
    private string $model;

    #[Column]
    private int $daily_price;

    public function getId(): int
    {
        return $this->id;
    }

    public function getCategory(): Category
    {
        return $this->category;
    }

    public function setCategory(Category $category): void
    {
        $this->category = $category;
    }

    public function getBrand(): string
    {
        return $this->brand;
    }

    public function setBrand(string $brand): void
    {
        $this->brand = $brand;
    }

    public function getModel(): string
    {
        return $this->model;
    }

    public function setModel(string $model): void
    {
        $this->model = $model;
    }

    public function getDaily_price(): int
    {
        return $this->daily_price;
    }

    public function setDaily_price(int $daily_price): void
    {
        $this->daily_price = $daily_price;
    }

    public function asAssocArray(): array
    {
        $array = [
            "id" => $this->getId(),
            "catName" => $this->getCategory()->getName(),
            "brand" => $this->getBrand(),
            "model" => $this->getModel(),
            "price" => $this->getDaily_price(),
        ];
        return $array;
    }
}
