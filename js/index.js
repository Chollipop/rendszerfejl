//Functions

function Login(){
    let user=document.getElementById("InputUsername").value;
    let passwd=document.getElementById("InputPassword").value;
    if(user=="admin" && passwd=="admin")
        window.location="list.html";
    else
        alert("non valid login");
}

// Event Listeners
document.getElementById("LoginButton").addEventListener("click",Login);