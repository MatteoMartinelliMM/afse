class ViewProvider {
    constructor() {
        this.BASE_PATH = '/afse/frontend/src/js/view'
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
                .catch(() => {
                    console.log('fail to load view')
                    reject();
                })
        })
    }
}

const controllerProvider = new ViewProvider()

Object.freeze(controllerProvider)

export default controllerProvider