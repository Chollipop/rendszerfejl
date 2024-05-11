try
{
    socket = new WebSocket("ws://127.0.0.1:8081/");
}
catch (e)
{ }

function deleteCookie(name)
{
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

function parseJwt(token)
{
    try
    {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c)
        {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
    catch (e)
    {
        return null;
    }
}

function Return()
{
    deleteCookie("jwt");
    window.location = "index.html";
}

function AddCarForm()
{
    let container = document.getElementById("container");
    container.innerHTML = "";

    const formElements = [
        { tag: 'label', attributes: { for: 'category', class: 'form-label' }, text: 'Category:' },
        { tag: 'select', attributes: { id: 'category', name: 'category', class: 'form-select' } },
        { tag: 'label', attributes: { for: 'brand', class: 'form-label' }, text: 'Brand:' },
        { tag: 'input', attributes: { type: 'text', id: 'brand', name: 'brand', class: 'form-control' } },
        { tag: 'label', attributes: { for: 'model', class: 'form-label' }, text: 'Model:' },
        { tag: 'input', attributes: { type: 'text', id: 'model', name: 'model', class: 'form-control' } },
        { tag: 'label', attributes: { for: 'daily_price', class: 'form-label' }, text: 'Daily Price:' },
        { tag: 'input', attributes: { type: 'number', id: 'daily_price', name: 'daily_price', class: 'form-control' } },
        { tag: 'input', attributes: { type: 'button', value: 'Submit', class: 'btn btn-primary mt-3 w-100', id: 'submit' } },
    ];

    formElements.forEach(element =>
    {
        const newElement = document.createElement(element.tag);
        for (let attr in element.attributes)
        {
            newElement.setAttribute(attr, element.attributes[attr]);
        }
        if (element.text)
        {
            newElement.textContent = element.text;
        }
        container.appendChild(newElement);
    });

    Categories();
    document.getElementById("submit").addEventListener("click", addCar);
}

function AddDiscountForm()
{
    let container = document.getElementById("container");
    container.innerHTML = "";

    const formElements = [
        { tag: 'label', attributes: { for: 'car', class: 'form-label' }, text: 'Car:' },
        { tag: 'select', attributes: { id: 'car', name: 'car', class: 'form-control' } },
        { tag: 'label', attributes: { for: 'description', class: 'form-label' }, text: 'Description:' },
        { tag: 'input', attributes: { type: 'text', id: 'description', name: 'description', class: 'form-control' } },
        { tag: 'label', attributes: { for: 'percent', class: 'form-label' }, text: 'Percent:' },
        { tag: 'input', attributes: { type: 'number', id: 'percent', name: 'percent', class: 'form-control' } },
        { tag: 'input', attributes: { type: 'button', value: 'Submit', class: 'btn btn-primary mt-3 w-100', id: 'submit' } },
    ];

    formElements.forEach(element =>
    {
        const newElement = document.createElement(element.tag);
        for (let attr in element.attributes)
        {
            newElement.setAttribute(attr, element.attributes[attr]);
        }
        if (element.text)
        {
            newElement.textContent = element.text;
        }
        container.appendChild(newElement);
    });

    AllCar();
    document.getElementById("submit").addEventListener("click", addDiscount);
}

async function Categories()
{
    let category = document.getElementById("category");
    let connection = await fetch("php/index.php/categories");
    if (connection.status == 200)
    {
        let cat = await connection.json();
        category.innerHTML = "";

        for (let j = 0; j < cat.length; j++)
        {
            let option = document.createElement("option");
            option.setAttribute("value", cat[j]["id"]);
            option.innerHTML = cat[j]["name"];
            category.appendChild(option);
        }
    }
    else if (connection.status == 401)
    {
        alert("Unauthorized, redirecting to login page");
        window.location = "index.html";
    }
}

async function AllCar()
{
    let car = document.getElementById("car");
    let connection = await fetch("php/index.php/allcar");
    if (connection.status == 200)
    {
        let data = await connection.json();
        car.innerHTML = "";

        for (let j = 0; j < data.length; j++)
        {
            let option = document.createElement("option");
            option.setAttribute("value", data[j]["id"]);
            option.innerHTML = `${data[j]["brand"]} ${data[j]["model"]}`;
            car.appendChild(option);
        }
    }
    else if (connection.status == 401)
    {
        alert("Unauthorized, redirecting to login page");
        window.location = "index.html";
    }
}

async function addCar()
{
    let category = document.getElementById("category").value;
    let brand = document.getElementById("brand").value;
    let model = document.getElementById("model").value;
    let daily_price = document.getElementById("daily_price").value;

    let send = {
        "category": category,
        "brand": brand,
        "model": model,
        "daily_price": daily_price
    };
    let connection = await fetch("php/index.php/addcar", {
        method: "POST",
        body: JSON.stringify(send)
    });
    if (connection.status == 200)
    {
        let data = await connection.json();
        if (data)
        {
            alert("Car added successfully");
        }
        else
        {
            alert("Error adding car");
        }
    }
    else if (connection.status == 401)
    {
        alert("Unauthorized, redirecting to login page");
        window.location = "index.html";
    }
}

async function addDiscount()
{
    let car = document.getElementById("car").value;
    let description = document.getElementById("description").value;
    let percent = document.getElementById("percent").value;
    let send = {
        "car": car,
        "description": description,
        "percent": percent
    };

    socket.send(JSON.stringify(send));

    socket.onmessage = (e) =>
    {
        let data = JSON.parse(e.data);

        if (data === false)
        {
            alert("Error adding discount");
        }
        else
        {
            alert("Discount added successfully");
        }
    }
}

{
    window.addEventListener("load", function ()
    {
        let jwt = getCookieValue("jwt");
        if (jwt != "")
        {
            try
            {
                let jwtData = parseJwt(jwt)["data"];
                if (jwtData["authLevel"] != "admin" || jwtData == null)
                {
                    alert("Unauthorized, redirecting to login page");
                    window.location = "index.html";
                }
            }
            catch (e)
            {
                alert("Unauthorized, redirecting to login page");
                window.location = "index.html";
            }
        }
    });
    window.addEventListener("load", AddCarForm);
    document.getElementById("carBtn").addEventListener("click", AddCarForm);
    document.getElementById("discount").addEventListener("click", AddDiscountForm);
    document.getElementById("logout").addEventListener("click", Return);
    window.addEventListener('pageshow', function (event)
    {
        if (event.persisted)
        {
            window.location.reload();
        }
    });
}