class HtmlPageLoader {
    constructor() {
        if (HtmlPageLoader.instance) {
            return HtmlPageLoader.instance
        }
        this.BASE_PATH = ''
        HtmlPageLoader.instance = this
    }

    loadPage(url) {
        console.log('calling: ', `${this.BASE_PATH}${url}.html`)
        return new Promise((resolve, reject) => {
            fetch(`${this.BASE_PATH}${url}.html`)
                .then((response) => {
                    console.log('my url is', `${this.BASE_PATH}${url}.html`)
                    return response.text();
                })
                .then((html) => {
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(html, 'text/html')
                    document.getElementById('content').innerHTML = doc.body.innerHTML
                    this.applyHeadContent(doc.head)
                    resolve();
                })
                .catch((e) => {
                    console.log('error for url', url)
                    console.error(e)
                    reject();
                })
        })
    }

    applyHeadContent(headContent) {
        // Append styles and scripts to the current document head
        const newTitle = headContent.querySelector('title');
        if (newTitle) {
            document.title = newTitle.textContent; // Cambia il titolo della pagina
        }
    }
}

const pageLoader = new HtmlPageLoader()

Object.freeze(pageLoader)

export default pageLoader