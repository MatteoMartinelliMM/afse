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
                    console.log('qua casca l asino')
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
        const stylesAndScripts = headContent.querySelectorAll('link[rel="stylesheet"], style, script');
        stylesAndScripts.forEach(node => {
            // Check if the style or script already exists in the document to avoid duplication
            if (!document.head.contains(node)) {
                document.head.appendChild(node.cloneNode(true));
            }
        });
    }
}

const pageLoader = new HtmlPageLoader()

Object.freeze(pageLoader)

export default pageLoader