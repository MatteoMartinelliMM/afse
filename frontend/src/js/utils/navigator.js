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
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        })
                        .catch((e) => console.log(e))
                )
                .catch(e => console.log(e))
        }
    }

    navigate(path) {
        this.routes[path] ? this.routes[path]() : this.routes['/404']()
    }

    listen(callback) {
        window.addEventListener('popstate', (event) => {
            const path = window.location.pathname.replace(this.BASE_PATH, '').split('.')[0]
            console.log('navigo verso: ', path)
            this.navigate(path)
            callback()
        })
        window.addEventListener('load', () => {
            console.log('reload');
            console.log(window.location.pathname);
            this.goTo(window.location.pathname.replace(this.BASE_PATH, ''), window.location.search)
        });
    }

    goTo(path, query = '') {
        path = path === '/' ? '/home' : path
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
navInstance.addRoute('/profile')
navInstance.addRoute('/404')

Object.freeze(navInstance)

export default navInstance