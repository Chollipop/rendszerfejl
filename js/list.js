function Setuser() {
    document.getElementById("user").innerHTML = "admin";
}

function Return() {
    window.location = "index.html";
}

async function SetupList() {
    let connection = await fetch("php/index.php/allcar");
    let data = await connection.json();
    let listgroup = document.getElementById("ListGroup");
    listgroup.innerHTML = "";
    for (var item of data) {
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

        let btn = document.createElement("button");
        btn.setAttribute("class", "btn btn-primary");
        btn.setAttribute("type", "button");
        btn.innerHTML = "Reserve";

        small.appendChild(btn);

        div.appendChild(small);

        a.appendChild(div);

        let p = document.createElement("p");
        p.setAttribute("class", "mb-1");
        p.innerHTML = "Category: " + item["catName"] + " Price:" + item["price"] + " $";

        a.appendChild(p);

        listgroup.appendChild(a);
    }
}

async function Categories() {
    let category = document.getElementById("SelectCategory");
    let connection = await fetch("php/index.php/categories");
    let data = await connection.json();
    category.innerHTML = "";

    let cat = [];
    cat.push("-", "SUV", "Sedan", "Hatchback", "Truck");

    for (let j = 0; j < cat.length; j++) {
        let option = document.createElement("option");
        option.setAttribute("value", cat[j]);
        option.innerHTML = cat[j];
        category.appendChild(option);

    }

}

async function ReworkList() {
    let connection = await fetch("php/index.php/allcar");
    let data = await connection.json();
    let category = document.getElementById("SelectCategory").value;
    let listgroup = document.getElementById("ListGroup");
    listgroup.innerHTML = "";

    if (category == "-")
        SetupList()
    else {
        for (var item of data) {
            if (category == item["catName"]) {
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

                let btn = document.createElement("button");
                btn.setAttribute("class", "btn btn-primary");
                btn.setAttribute("type", "button");
                btn.innerHTML = "Reserve";

                small.appendChild(btn);

                div.appendChild(small);

                a.appendChild(div);

                let p = document.createElement("p");
                p.setAttribute("class", "mb-1");
                p.innerHTML = "Category: " + item["catName"] + " Price:" + item["price"] + " $";

                a.appendChild(p);

                listgroup.appendChild(a);
            }
        }
    }
}

// Event Listeners
window.addEventListener("load", Setuser);
window.addEventListener("load", SetupList);
window.addEventListener("load", Categories);
document.getElementById("logout").addEventListener("click", Return);
document.getElementById("SelectCategory").addEventListener("change", ReworkList);