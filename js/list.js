function Setuser()
{
    document.getElementById("user").innerHTML = "user (previous rentals)";
    document.getElementById("user").setAttribute("value", 2);
}

function Return()
{
    window.location = "index.html";
}

async function SetupList()
{
    $("#SelectCategory").show();
    let connection = await fetch("php/index.php/allcar");
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
        let availabilityResult = await availabilityConn.json();
        let invalidDates = [];
        if (availabilityResult.length != 0)
        {
            availabilityResult.forEach(e =>
            {
                let start = new Date(e["from_date"]["date"]);

                let end = new Date(e["to_date"]["date"]);
                invalidDates = invalidDates.concat(getDates(start, end));
            });
        }

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
                        if (isInvalidDateCheck(invalidDates, date))
                        {
                            return true;
                        }
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

function isInvalidDateCheck(array, date)
{
    let dateToCheck = new Date(date.format('YYYY-MM-DD'));

    return isInDateArray(array, dateToCheck)
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

//js dates and timezones can go to hell
function isInDateArray(array, dateToCheck)
{
    return array.some(function (arrVal)
    {
        arrVal = arrVal.toLocaleDateString("hu-HU")
            .replaceAll('.', '')
            .replaceAll(' ', '-');

        return dateToCheck.toISOString().split('T')[0] == arrVal;
    });
}

async function CalcPrice(start, end, id, invalidDates)
{
    var dates = getDates(start, end);
    let invalidReservation = false;
    dates.shift();
    dates.forEach(d =>
    {
        if (isInDateArray(invalidDates, d))
        {
            invalidReservation = true;
        }
    });
    if (invalidReservation)
    {
        alert("Invalid dates selected");
    }
    else
    {
        let send =
        {
            "userId": document.getElementById("user").getAttribute("value"),
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
            dailyPrice = data2[0]["daily_price"];
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
            alert(`Successful reservation: ${discountedPrice * diffDays} Ft`);
        }
    }
}

async function Categories()
{
    let category = document.getElementById("SelectCategory");
    let connection = await fetch("php/index.php/categories");
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
            let availabilityResult = await availabilityConn.json();
            let invalidDates = [];
            if (availabilityResult.length != 0)
            {
                availabilityResult.forEach(e =>
                {
                    let start = new Date(e["from_date"]["date"]);

                    let end = new Date(e["to_date"]["date"]);
                    invalidDates = invalidDates.concat(getDates(start, end));
                });
            }

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
                            if (isInvalidDateCheck(invalidDates, date))
                            {
                                return true;
                            }
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
}

async function PreviousRentals()
{
    $("#SelectCategory").hide();
    let userId = document.getElementById("user").getAttribute("value");
    let send =
    {
        "userId": userId
    };
    let connection = await fetch("php/index.php/previousRentals",
        {
            method: "POST",
            body: JSON.stringify(send)
        });
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

async function Discounts()
{
    $("#SelectCategory").hide();
    let connection = await fetch("php/index.php/discounts");
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
        console.log(idToPass);

        let availabilityData =
        {
            "id": idToPass
        };
        let availabilityConn = await fetch("php/index.php/availability",
            {
                method: "POST",
                body: JSON.stringify(availabilityData)
            });
        let availabilityResult = await availabilityConn.json();
        let invalidDates = [];
        if (availabilityResult.length != 0)
        {
            availabilityResult.forEach(e =>
            {
                let start = new Date(e["from_date"]["date"]);

                let end = new Date(e["to_date"]["date"]);
                invalidDates = invalidDates.concat(getDates(start, end));
            });
        }

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
                        if (isInvalidDateCheck(invalidDates, date))
                        {
                            return true;
                        }
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
}