//Functions

async function Login()
{
    let user = document.getElementById("InputUsername").value;
    let passwd = document.getElementById("InputPassword").value;
    let send =
    {
        "username": user,
        "pwd": passwd
    };
    let connection = await fetch("php/index.php/login",
        {
            method: "POST",
            body: JSON.stringify(send)
        });
    let data = await connection.json();
    if (data)
        window.location = "list.html";
    else
        alert("invalid login");
}

async function createDb()
{
    let connection = await fetch("php/index.php/createDb");
}

// Event Listeners
document.getElementById("LoginButton").addEventListener("click", Login);
window.addEventListener("load", createDb);