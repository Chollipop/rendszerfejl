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
    {
        let jwt = getCookieValue("jwt");
        let jwtData = parseJwt(jwt)["data"];
        if (jwtData["authLevel"] == "user")
        {
            window.location = "list.html";
        }
        else if (jwtData["authLevel"] == "admin")
        {
            window.location = "admin.html";
        }
    }
    else
        alert("invalid login");
    return;
}

async function createDb()
{
    let connection = await fetch("php/index.php/createDb");
}

function doesJwtExist()
{
    let jwt = getCookieValue("jwt");
    if (jwt != "")
    {
        Login();
    }
}

// Event Listeners
document.getElementById("LoginButton").addEventListener("click", Login);
window.addEventListener("load", async () => { await createDb(); doesJwtExist(); });
window.addEventListener('pageshow', function (event)
{
    if (event.persisted)
    {
        window.location.reload();
    }
});