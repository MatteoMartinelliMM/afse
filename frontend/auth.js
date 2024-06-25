function registerUser() {
    let name = document.getElementById("name").value;
    let surname = document.getElementById("surname").value;
    let email = document.getElementById("email").value;
    let pwd = document.getElementById("pwd").value;
    let confirmPwd = document.getElementById("confirmPwd").value;
    if (confirmPwd !== pwd) {
        console.log("Pwd should match")
        return undefined;
    }
    console.log(JSON.stringify({
        name: name, surname: surname, email: email, pwd: pwd, confirmPwd: confirmPwd,
    }));
    let options = {
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: "POST", body: JSON.stringify({
            name: name, surname: surname, email: email, pwd: pwd, confirmPwd: confirmPwd,
        })
    }
    fetch('http://localhost:3000/auth/register', options)
        .then(response => response.json())
        .then(json => console.log(json))
}

function loginUser() {
    let email = document.getElementById("email").value;
    let pwd = document.getElementById("pwd").value;

    let opt = {
        method: "POST",
        body: JSON.stringify({email: email, pwd: pwd}),
        headers: {"Content-Type": "application/json",}
    }
    fetch('http://localhost:3000/auth/login', opt)
        .then((response) => response.json())
        .then((json) => console.log(json))
}