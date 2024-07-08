class ViewProvider {
    constructor() {
        this.BASE_PATH = '/js/view'
    }

    getView(path) {
        const p = path || '/'
        console.log('calling: ', `${this.BASE_PATH}${p}.js`)
        return new Promise((resolve, reject) => {
            import(`${this.BASE_PATH}${p}.js`)
                .then((controller) => {
                    console.log(controller)
                    resolve(controller);
                })
                .catch((e) => {
                    console.log(e)
                    console.log('fail to load view')
                    reject();
                })
        })
    }
}

const viewProvider = new ViewProvider()

Object.freeze(viewProvider)

export default viewProvider