const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)

function parseJwt(token)
{
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c)
    {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function Setuser()
{
    let jwt = getCookieValue("jwt");
    if (jwt != "")
    {
        let jwtData = parseJwt(jwt)["data"];
        document.getElementById("user").innerHTML = `${jwtData["username"]} (previous rentals)`;
    }
}

function deleteCookie(name)
{
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function Return()
{
    deleteCookie("jwt");
    window.location = "index.html";
}

async function SetupList()
{
    $("#SelectCategory").show();
    let connection = await fetch("php/index.php/allcar");
    if (connection.status == 200)
    {
        let data = await connection.json();
        let listgroup = document.getElementById("ListGroup");
        listgroup.innerHTML = "";
        $("#SelectCategory").val("-1");
        for (var item of data)
        {
            let a = document.createElement("a");
            a.setAttribute("class", "list-group-item list-group-item-action");
            a.setAttribute("aria-current", "true");

            let div = document.createElement("div");
            div.setAttribute("class", "d-flex w-100 justify-content-between");

            let h5 = document.createElement("h5");
            h5.setAttribute("class", "mb-1");
            h5.innerHTML = item["brand"] + " " + item["model"];

            div.appendChild(h5);

            let small = document.createElement("small");

            let btn = document.createElement("input");
            btn.setAttribute("class", "btn btn-primary");
            btn.setAttribute("type", "text");
            btn.setAttribute("id", `${item["id"]}`);
            btn.setAttribute("value", `${item["id"]}`);

            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            let momentDate = moment(tomorrow);

            let idToPass = $(btn).val();

            let availabilityData =
            {
                "id": idToPass
            };
            let availabilityConn = await fetch("php/index.php/availability",
                {
                    method: "POST",
                    body: JSON.stringify(availabilityData)
                });
            let invalidDates = await availabilityConn.json();

            $(btn).daterangepicker(
                {
                    opens: 'left',
                    minDate: momentDate.format('MM/DD/YYYY'),
                    startDate: momentDate.format('MM/DD/YYYY'),
                    endDate: momentDate.format('MM/DD/YYYY'),
                    isInvalidDate: function (date)
                    {
                        if (invalidDates.length != 0)
                        {
                            date = (new Date(date.format('YYYY-MM-DD')).toLocaleDateString("hu-HU"))
                                .replaceAll('.', '')
                                .replaceAll(' ', '-')

                            return isInvalidDateCheck(invalidDates, date);
                        }
                    }
                },
                function (start, end)
                {
                    CalcPrice(start, end, idToPass, invalidDates);
                }
            );

            btn.setAttribute("value", "Reserve");
            btn.setAttribute("name", "");

            small.appendChild(btn);

            div.appendChild(small);

            a.appendChild(div);

            let p = document.createElement("p");
            p.setAttribute("class", "mb-1");
            p.innerHTML = "Category: " + item["catName"] + ", Daily price: $" + item["price"] + "";

            a.appendChild(p);

            listgroup.appendChild(a);
        }
    }
    else if (connection.status == 401)
    {
        alert("Unauthorized, redirecting to login page");
        window.location = "index.html";
    }
}

//js dates and timezones can go to hell
function isInvalidDateCheck(array, date)
{
    let isInValid = false;
    let dateToCheck = (new Date(date)).getTime();

    for (let i = 0; i < array.length; i++)
    {
        let from = (new Date(array[i][0]["date"].split(' ')[0])).getTime();
        let to = (new Date(array[i][1]["date"].split(' ')[0])).getTime();

        if (dateToCheck >= from && dateToCheck <= to)
        {
            isInValid = true;
            break;
        }
    }
    return isInValid;
}

const getDates = (startDate, endDate) =>
{
    let dates = []
    const theDate = new Date(startDate)
    while (theDate < new Date(endDate))
    {
        dates = [...dates, new Date(theDate)]
        theDate.setDate(theDate.getDate() + 1)
    }
    dates = [...dates, new Date(endDate)]
    return dates
}

async function CalcPrice(start, end, id, invalidDates)
{
    let invalidReservation = false;

    var dates = getDates(start, end);
    for (let i = 0; i < dates.length; i++)
    {
        dates[i] = dates[i].toLocaleDateString("hu-HU")
            .replaceAll('.', '')
            .replaceAll(' ', '-');
    }

    dates = [...new Set(dates)];

    for (let i = 0; i < dates.length; i++)
    {
        if (isInvalidDateCheck(invalidDates, dates[i]))
        {
            invalidReservation = true;
            break;
        }
    }

    if (invalidReservation)
    {
        alert("Invalid dates selected");
    }
    else
    {
        let send =
        {
            "carId": id,
            "fromDate": start.format('YYYY MM DD'),
            "toDate": end.format('YYYY MM DD'),
            "created": (new Date().toLocaleDateString("hu-HU").replaceAll('.', ''))
        };
        let connection = await fetch("php/index.php/rent",
            {
                method: "POST",
                body: JSON.stringify(send)
            });

        let dailyPrice;
        let discountedPrice = document.getElementById(id).getAttribute("name");
        if (discountedPrice == "")
        {
            let conn2 = await fetch("php/index.php/price",
                {
                    method: "POST",
                    body: JSON.stringify({ "id": id })
                });
            let data2 = await conn2.json();
            dailyPrice = data2;
        }

        document.getElementById(id).disabled = true;
        const date1 = new Date(start.format('MM/DD/YYYY'));
        const date2 = new Date(end.format('MM/DD/YYYY'));
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (discountedPrice == "")
        {
            alert(`Successful reservation: $${dailyPrice * diffDays}`);
        }
        else
        {
            alert(`Successful reservation: $${discountedPrice * diffDays}`);
        }
    }
}

async function Categories()
{
    let category = document.getElementById("SelectCategory");
    let connection = await fetch("php/index.php/categories");
    if (connection.status == 200)
    {
        let cat = await connection.json();
        category.innerHTML = "";

        cat = [{ "id": -1, "name": "-" }, ...cat];

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
        window.location = "index.html";
    }
}

async function ReworkList()
{
    let category = document.getElementById("SelectCategory").value;
    let listgroup = document.getElementById("ListGroup");
    listgroup.innerHTML = "";
    if (category == "-1")
    {
        SetupList();
    }
    else
    {
        let send =
        {
            "category": category
        };
        let connection = await fetch("php/index.php/carsincategory",
            {
                method: "POST",
                body: JSON.stringify(send)
            });
        if (connection.status == 200)
        {
            let data = await connection.json();
            for (var item of data)
            {
                let a = document.createElement("a");
                a.setAttribute("class", "list-group-item list-group-item-action");
                a.setAttribute("aria-current", "true");

                let div = document.createElement("div");
                div.setAttribute("class", "d-flex w-100 justify-content-between");

                let h5 = document.createElement("h5");
                h5.setAttribute("class", "mb-1");
                h5.innerHTML = item["brand"] + " " + item["model"];

                div.appendChild(h5);

                let small = document.createElement("small");

                let btn = document.createElement("input");
                btn.setAttribute("class", "btn btn-primary");
                btn.setAttribute("type", "text");
                btn.setAttribute("id", `${item["id"]}`);
                btn.setAttribute("value", `${item["id"]}`);

                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                let momentDate = moment(tomorrow);

                let idToPass = $(btn).val();

                let availabilityData =
                {
                    "id": idToPass
                };
                let availabilityConn = await fetch("php/index.php/availability",
                    {
                        method: "POST",
                        body: JSON.stringify(availabilityData)
                    });
                let invalidDates = await availabilityConn.json();

                $(btn).daterangepicker(
                    {
                        opens: 'left',
                        minDate: momentDate.format('MM/DD/YYYY'),
                        startDate: momentDate.format('MM/DD/YYYY'),
                        endDate: momentDate.format('MM/DD/YYYY'),
                        isInvalidDate: function (date)
                        {
                            if (invalidDates.length != 0)
                            {
                                date = (new Date(date.format('YYYY-MM-DD')).toLocaleDateString("hu-HU"))
                                    .replaceAll('.', '')
                                    .replaceAll(' ', '-')

                                return isInvalidDateCheck(invalidDates, date);
                            }
                        }
                    },
                    function (start, end)
                    {
                        CalcPrice(start, end, idToPass, invalidDates);
                    }
                );

                btn.setAttribute("value", "Reserve");
                btn.setAttribute("name", "");

                small.appendChild(btn);

                div.appendChild(small);

                a.appendChild(div);

                let p = document.createElement("p");
                p.setAttribute("class", "mb-1");
                p.innerHTML = "Category: " + item["catName"] + ", Daily price: $" + item["price"] + "";

                a.appendChild(p);

                listgroup.appendChild(a);
            }
        }
        else if (connection.status == 401)
        {
            alert("Unauthorized, redirecting to login page");
            window.location = "index.html";
        }
    }
}

async function PreviousRentals()
{
    $("#SelectCategory").hide();
    let connection = await fetch("php/index.php/previousRentals");
    if (connection.status == 200)
    {
        let data = await connection.json();

        let listgroup = document.getElementById("ListGroup");
        listgroup.innerHTML = "";
        for (var item of data)
        {
            let a = document.createElement("a");
            a.setAttribute("class", "list-group-item list-group-item-action");
            a.setAttribute("aria-current", "true");

            let div = document.createElement("div");
            div.setAttribute("class", "d-flex w-100 justify-content-between");

            let h5 = document.createElement("h5");
            h5.setAttribute("class", "mb-1");
            h5.innerHTML = item["brand"] + " " + item["model"];

            div.appendChild(h5);

            let small = document.createElement("small");
            small.innerHTML =
                `${item["from_date"]["date"].split(' ')[0]}
            - ${item["to_date"]["date"].split(' ')[0]}
            <br>Reservation made on:
            ${item["created"]["date"].split('.')[0]}`;
            const date1 = new Date(item["from_date"]["date"]);
            const date2 = new Date(item["to_date"]["date"]);
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            div.appendChild(small);

            a.appendChild(div);

            let p = document.createElement("p");
            p.setAttribute("class", "mb-1");
            p.innerHTML = "Category: " + item["name"] + ", Daily price: $" + item["daily_price"] + "";
            p.innerHTML += `, Total price: $${diffDays * item["daily_price"]}`;

            a.appendChild(p);

            listgroup.appendChild(a);
        }
    }
    else if (connection.status == 401)
    {
        alert("Unauthorized, redirecting to login page");
        window.location = "index.html";
    }
}

async function Discounts()
{
    $("#SelectCategory").hide();
    let connection = await fetch("php/index.php/discounts");
    if (connection.status == 200)
    {
        let data = await connection.json();
        let listgroup = document.getElementById("ListGroup");
        listgroup.innerHTML = "";
        for (var item of data)
        {
            let a = document.createElement("a");
            a.setAttribute("class", "list-group-item list-group-item-action");
            a.setAttribute("aria-current", "true");

            let div = document.createElement("div");
            div.setAttribute("class", "d-flex w-100 justify-content-between");

            let h5 = document.createElement("h5");
            h5.setAttribute("class", "mb-1");
            h5.innerHTML = item["brand"] + " " + item["model"];

            div.appendChild(h5);

            let small = document.createElement("small");

            let btn = document.createElement("input");
            btn.setAttribute("class", "btn btn-primary");
            btn.setAttribute("type", "text");
            btn.setAttribute("id", `${item["car_Id"]}`);
            btn.setAttribute("value", `${item["car_Id"]}`);

            let tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            let momentDate = moment(tomorrow);

            let idToPass = $(btn).val();

            let availabilityData =
            {
                "id": idToPass
            };
            let availabilityConn = await fetch("php/index.php/availability",
                {
                    method: "POST",
                    body: JSON.stringify(availabilityData)
                });
            let invalidDates = await availabilityConn.json();

            $(btn).daterangepicker(
                {
                    opens: 'left',
                    minDate: momentDate.format('MM/DD/YYYY'),
                    startDate: momentDate.format('MM/DD/YYYY'),
                    endDate: momentDate.format('MM/DD/YYYY'),
                    isInvalidDate: function (date)
                    {
                        if (invalidDates.length != 0)
                        {
                            date = (new Date(date.format('YYYY-MM-DD')).toLocaleDateString("hu-HU"))
                                .replaceAll('.', '')
                                .replaceAll(' ', '-')

                            return isInvalidDateCheck(invalidDates, date);
                        }
                    }
                },
                function (start, end)
                {
                    CalcPrice(start, end, idToPass, invalidDates);
                }
            );

            btn.setAttribute("value", "Reserve");
            btn.setAttribute("name", `${item["price"] - (item["price"] * (item["percent"]) / 100)}`);

            small.appendChild(btn);

            div.appendChild(small);

            a.appendChild(div);

            let p = document.createElement("p");
            p.setAttribute("class", "mb-1");
            p.innerHTML =
                "Category: " + item["catName"] +
                ", Daily price: $" + item["price"] +
                "<br>Discount: " + item["percent"] +
                "%, Discounted price: $" + (item["price"] - (item["price"] * (item["percent"] / 100)));
            a.appendChild(p);

            listgroup.appendChild(a);
        }
    }
    else if (connection.status == 401)
    {
        alert("Unauthorized, redirecting to login page");
        window.location = "index.html";
    }
}

// Event Listeners
{
    window.addEventListener("load", Setuser);
    window.addEventListener("load", SetupList);
    window.addEventListener("load", Categories);
    document.getElementById("list").addEventListener("click", SetupList);
    document.getElementById("logout").addEventListener("click", Return);
    document.getElementById("SelectCategory").addEventListener("change", ReworkList);
    document.getElementById("user").addEventListener("click", PreviousRentals);
    document.getElementById("discounts").addEventListener("click", Discounts);
    window.addEventListener('pageshow', function (event)
    {
        if (event.persisted)
        {
            window.location.reload();
        }
    });
}