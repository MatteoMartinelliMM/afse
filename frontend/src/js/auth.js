export function registerUser(user) {
    console.log('diobono')
    console.log(JSON.stringify(user));
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(user)
    }
    return new Promise((resolve, reject) => {
        fetch('http:localhost:3000/auth/register', options)
            .then(response => {
                if (response.status === 200) {
                    resolve()
                    return
                }
                reject()
            })
            .catch((e) => reject(e))
    })

}

export function loginUser(email, pwd) {
    let opt = {
        method: "POST",
        body: JSON.stringify({email: email, pwd: pwd}),
        headers: {"Content-Type": "application/json",},
        credentials: 'include',
    }
    return new Promise((resolve, reject) => {
        fetch('http://localhost:3000/auth/login', opt)
            .then((response) => {
                if (response.status === 200) {
                    resolve()
                    return;
                }
                reject()
            }).catch((e) => reject())
    });

}