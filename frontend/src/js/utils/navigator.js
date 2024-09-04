import pageLoader from "./htmlPageLoader.js";
import viewProvider from "./viewProvider.js";


class Navigator {
    constructor() {
        if (Navigator.instance) {
            return Navigator.instance
        }
        this.BASE_PATH = '/afse'
        this.routes = {}
        Navigator.instance = this
    }

    addRoute(path) {
        this.routes[path] = () => {
            pageLoader.loadPage(path)
                .then(() =>
                    viewProvider.getView(path)
                        .then((view) => {
                            view.render();
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
            const path = window.location.pathname.replace(this.BASE_PATH, '').split('.')[0]
            console.log('navigo verso: ', path)
            this.navigate(path)
            console.log('dal listner')
            callback()
        })
        window.addEventListener('load', () => {
            console.log('reload');
            console.log(window.location.pathname);
            this.goTo(window.location.pathname.replace(this.BASE_PATH, ''), window.location.search)
            //const path = window.location.pathname.replace(navInstance.BASE_PATH, '');
            //navInstance.navigate(path); // Navigate using your SPA's routing logic on initial load
        });
    }

    goTo(path, query = '') {
        const fullPath = this.BASE_PATH + path;
        console.log(fullPath)
        window.history.pushState({}, '', window.location.origin + fullPath + query)
        this.navigate(path)
    }

    goToAndReplace(path, query= ''){
        const fullPath = this.BASE_PATH + path;
        console.log(fullPath)
        window.history.replaceState(null, '', window.location.origin + fullPath + query)
        this.navigate(path)
    }

    getQueryParams() {
        return new URLSearchParams(window.location.search);
    }
}

const navInstance = new Navigator()
navInstance.addRoute('/')
navInstance.addRoute('/register')
navInstance.addRoute('/login')
navInstance.addRoute('/home')
navInstance.addRoute('/album')
navInstance.addRoute('/trades')
navInstance.addRoute('/tradeOffer')
navInstance.addRoute('/shop')
navInstance.addRoute('/hero')
navInstance.addRoute('/packRedeem')

Object.freeze(navInstance)

export default navInstance