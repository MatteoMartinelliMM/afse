import navigator from "@/js/utils/navigator";

class HttpInteractor {
    constructor() {
    }

    async getAuthenticated(url, options = {}) {
        options.method = 'GET'
        options.credentials = 'include'
        return this.#doTheCall(url, options);
    }

    async postAuthenticated(url, options = {}) {
        options.method = 'POST'
        options.credentials = 'include'
        return this.#doTheCall(url, options)
    }

    async deleteAuthenticated(url, options = {}) {
        options.method = 'DELETE'
        options.credentials = 'include'
        return this.#doTheCall(url, options)
    }

    async putAuthenticated(url, options = {}) {
        options.method = 'PUT'
        options.credentials = 'include'
        return this.#doTheCall(url, options)
    }

    async get(url, options = {}) {
        options.method = 'GET'
        return this.#doTheCall(url, options);
    }

    async post(url, options = {}) {
        options.method = 'POST'
        return this.#doTheCall(url, options);
    }

    #doTheCall(url, options) {
        console.log('calling: ', url)
        return new Promise((resolve, reject) => {
            fetch(url, options).then((res) => {
                if (res.status === 401) {
                    sessionStorage.setItem('isAuthenticated', 'false')
                    navigator.goTo('/login')
                    reject('userNoAuth')
                    return;
                }
                if (res.status >= 400)
                    reject(res.status)

                return res.json();
            }).then((json) => {
                resolve(json)
            }).catch((e) => {
                console.log('erorre in doTheCall', e)
                reject(e);
            })
        })
    }
}

export default HttpInteractor