class IndexController {
    constructor() {
    }

    onPageLoad() {
        let opt = {
            method: "GET",
            headers: {"Content-Type": "application/json",},
            credentials: 'include',
        }
        return new Promise((resolve, reject) => {
            fetch('http://localhost:3000/home', opt) // Replace with your API endpoint
                .then(response => {
                    if (response.status !== 200) {
                        reject()
                        return
                    }
                    return response.json();
                })
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    reject()
                });
        })
    }

    showNavbar(route) {
        return !(route ==='/login' || route === '/register')
    }
}

export default IndexController