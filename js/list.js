function Setuser()
{
    document.getElementById("user").innerHTML = "user (previous rentals)";
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
    $("#SelectCategory").val("-");
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
        btn.addEventListener("focus", Reserve);
        btn.innerHTML = "Reserve";
        btn.setAttribute("value", "Reserve");
        btn.setAttribute("name", "");

        small.appendChild(btn);

        div.appendChild(small);

        a.appendChild(div);

        let p = document.createElement("p");
        p.setAttribute("class", "mb-1");
        p.innerHTML = "Category: " + item["catName"] + " Price:" + item["price"] + " $";
        if (item["discount"] > 0)
        {
            p.innerHTML += `Discount percent: ${item["discount"]}%`;
            btn.setAttribute("name", `${item["price"] - (item["price"] * (item["discount"]) / 100)}`);
        }

        a.appendChild(p);

        listgroup.appendChild(a);
    }
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

function isInDateArray(array, value)
{
    return array.some(function (arrVal)
    {
        return value.toISOString().split('T')[0] === arrVal.toISOString().split('T')[0];
    });
}

async function Reserve()
{
    let send =
    {
        "id": this.id
    };
    let connection = await fetch("php/index.php/availability",
        {
            method: "POST",
            body: JSON.stringify(send)
        });
    let data = await connection.json();
    let id = this.id;
    let dailyPrice = data[2];
    let start = new Date(data[0]);
    let end = new Date(data[1]);
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let momentDate = moment(tomorrow);
    var invalidDates = getDates(start, end);
    $(this).daterangepicker(
        {
            opens: 'left',
            minDate: momentDate.format('MM/DD/YYYY'),
            isInvalidDate: function (date)
            {
                let dateToCheck = new Date(date.format('YYYY-MM-DD'));
                if (isInDateArray(invalidDates, dateToCheck))
                {
                    return true;
                }
            }
        },
        function (start, end)
        {
            var dates = getDates(start, end);
            let invalidReservation = false;
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
                CalcPrice(start, end, id, dailyPrice);
            }
        },
    );
}

function CalcPrice(start, end, id, dailyPrice)
{
    document.getElementById(id).disabled = true;
    const date1 = new Date(start.format('MM/DD/YYYY'));
    const date2 = new Date(end.format('MM/DD/YYYY'));
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    let discountedPrice = document.getElementById(id).getAttribute("name");

    if (discountedPrice == "")
    {
        alert(`Sikeres foglalás: ${dailyPrice * diffDays} Ft`);
    }
    else
    {
        alert(`Sikeres foglalás: ${discountedPrice * diffDays} Ft`);
    }
}

async function Categories()
{
    let category = document.getElementById("SelectCategory");
    let connection = await fetch("php/index.php/categories");
    let cat = await connection.json();
    category.innerHTML = "";

    cat = ["-", ...cat];

    for (let j = 0; j < cat.length; j++)
    {
        let option = document.createElement("option");
        option.setAttribute("value", cat[j]);
        option.innerHTML = cat[j];
        category.appendChild(option);

    }

}

async function ReworkList()
{
    let connection = await fetch("php/index.php/allcar");
    let data = await connection.json();
    let category = document.getElementById("SelectCategory").value;
    let listgroup = document.getElementById("ListGroup");
    listgroup.innerHTML = "";

    if (category == "-")
        SetupList()
    else
    {
        for (var item of data)
        {
            if (category == item["catName"])
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
                btn.addEventListener("focus", Reserve);
                btn.setAttribute("value", "Reserve");
                btn.setAttribute("name", "");

                small.appendChild(btn);

                div.appendChild(small);

                a.appendChild(div);

                let p = document.createElement("p");
                p.setAttribute("class", "mb-1");
                p.innerHTML = "Category: " + item["catName"] + " Price:" + item["price"] + " $";
                if (item["discount"] > 0)
                {
                    p.innerHTML += `Discount percent: ${item["discount"]}%`;
                    btn.setAttribute("name", `${item["price"] - (item["price"] * (item["discount"]) / 100)}`);
                }

                a.appendChild(p);

                listgroup.appendChild(a);
            }
        }
    }
}

async function PreviousRentals()
{
    $("#SelectCategory").hide();
    let username = document.getElementById("user").innerHTML;
    let send =
    {
        "username": username
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
        small.innerHTML = `${item["from_date"]} - ${item["to_date"]}`;
        const date1 = new Date(item["from_date"]);
        const date2 = new Date(item["to_date"]);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        div.appendChild(small);

        a.appendChild(div);

        let p = document.createElement("p");
        p.setAttribute("class", "mb-1");
        p.innerHTML = "Category: " + item["catName"] + " Daily price:" + item["daily_price"] + " $";
        p.innerHTML += ` Total price: ${diffDays * item["daily_price"]} $`;

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
        btn.setAttribute("id", `${item["id"]}`);
        btn.addEventListener("focus", Reserve);
        btn.innerHTML = "Reserve";
        btn.setAttribute("value", "Reserve");
        btn.setAttribute("name", `${item["price"] - (item["price"] * (item["percent"]) / 100)}`);

        small.appendChild(btn);

        div.appendChild(small);

        a.appendChild(div);

        let p = document.createElement("p");
        p.setAttribute("class", "mb-1");
        p.innerHTML = "Category: " + item["catName"] + " Price:" + item["price"] + " $";
        p.innerHTML += ` Discount percentage: ${item["percent"]}% Discounted price: ${item["price"] - (item["price"] * (item["percent"]) / 100)} $`;

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