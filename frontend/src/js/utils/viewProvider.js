class ViewProvider {
    constructor() {
        this.BASE_PATH = '../view'
    }

    getView(path) {
        console.log('ci siamo: ', path)
        console.log('chiamo: ', `@/js/view${path}.js`)
        return new Promise((resolve, reject) => {
            import(/* webpackChunkName: "view-[request]" */`@/js/view${path}.js`)
                .then((module) => {
                    const ViewClass = module.default
                    const view = new ViewClass()
                    console.log(view)
                    resolve(view);
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