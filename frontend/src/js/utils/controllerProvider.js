class ControllerProvider {
    constructor() {
        this.BASE_PATH = '/afse/frontend/src/js/view'
    }

    getController(path) {
        const p = path || '/'
        console.log('calling: ', `${this.BASE_PATH}${p}.js`)
        return new Promise( (resolve, reject) => {
            import(`${this.BASE_PATH}${p}.js`)
                .then((controller) => {
                    console.log(controller)
                    resolve(controller);
                })
                .catch(() => reject())
        })
    }
}

const controllerProvider = new ControllerProvider()

Object.freeze(controllerProvider)

export default controllerProvider