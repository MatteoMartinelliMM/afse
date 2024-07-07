import pageLoader from "./htmlPageLoader.js";
import controllerProvider from "./controllerProvider.js";


class Navigator {
    constructor() {
        if (Navigator.instance) {
            return Navigator.instance
        }
        this.BASE_PATH = '/afse/frontend/public'
        this.routes = {}
        Navigator.instance = this
    }

    addRoute(path, callback) {
        this.routes[path] = () => {
            pageLoader.loadPage(path)
                .then(() =>
                    controllerProvider.getController(path)
                        .then((controller) => {
                            controller.render();
                            return callback();
                        })
                        .catch((e) => console.log(e))
                )
                .catch(e => console.log(e))
        }
    }

    navigate(path) {
        this.routes[path] ? this.routes[path]() : console.error(`Route for ${path} not found`)
    }

    listen(callback) {
        window.addEventListener('popstate', (event) => {
            console.log('chiamato il listner')
            this.navigate(window.location.pathname)
            console.log('dal listner')
            console.log(window.location.pathname)
            callback()
        })
    }

    goTo(path) {
        const fullPath = this.BASE_PATH + path;
        console.log(fullPath)
        window.history.length > 1 ? window.history.replaceState({}, window.location.origin + fullPath)
            : window.history.pushState({}, window.location.origin + fullPath)
        this.navigate(path)
    }
}

const navInstance = new Navigator()

Object.freeze(navInstance)

export default navInstance