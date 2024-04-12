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
        console.log(token);
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

async function Categories()
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
        alert("Car added successfully");
    }
    else if (connection.status == 401)
    {
        alert("Unauthorized, redirecting to login page");
        window.location = "index.html";
    }
}

{
    window.addEventListener("load", Categories);
    document.getElementById("submit").addEventListener("click", addCar);
    document.getElementById("logout").addEventListener("click", Return);
    window.addEventListener('pageshow', function (event)
    {
        if (event.persisted)
        {
            window.location.reload();
        }
    });
}