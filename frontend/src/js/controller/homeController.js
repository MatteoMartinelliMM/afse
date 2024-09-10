import HttpInteractor from "@/js/utils/httpInteractor";

class HomeController {
    constructor() {
        this.collectionPageDownloaded = []
        this.currentCollectionPage = 1
    }

    getUserInfo() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated('http://localhost:3000/home/user')
                .then(user => {
                    this.user = user
                    resolve(this.user)
                })
                .catch(e => {
                    console.log(e)
                    reject('userInfoError')
                })
        })
    }

    loadSection(section) {
        switch (section) {
            case 'collection':
                return this.getUserCollection();
            default:
                return;
        }
    }

    getUserCollection() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated(`http://localhost:3000/home/collection/${this.currentCollectionPage}`)
                .then(cards => {
                    this.currentCollectionPage = cards.page
                    this.totalPageCollection = cards.totalPages
                    this.totalCardInCollection = cards.total
                    this.collectionPageDownloaded.push(cards.page)
                    resolve(cards.figurine)
                })
                .catch(e => {
                    console.log(e)
                    reject('networkError')
                })
        })
    }

    onCollectionNextPagePressed() {
        this.currentCollectionPage + 1 <= this.totalPageCollection  ? ++this.currentCollectionPage : this.currentCollectionPage = 1
        return this.collectionPageDownloaded.findIndex(page => page === this.currentCollectionPage) === -1
        /* return new Promise((resolve, reject) => {
             if () {
                 this.getUserCollection()
                     .then(cards => {
                         resolve(cards)
                     }).catch(e => reject(e))
                 return;
             }
             resolve('alreadyDownloaded')
         })*/
    }

    onCollectionPreviousPagePressed() {
        this.currentCollectionPage - 1 !== 0 ? --this.currentCollectionPage : this.currentCollectionPage = this.totalPageCollection
        return this.collectionPageDownloaded.findIndex(page => page === this.currentCollectionPage) === -1
        /*return new Promise((resolve, reject) => {
            if () {
                this.getUserCollection()
                    .then(cards => {
                        resolve(cards)
                    }).catch(e => reject(e))
                return;
            }
            resolve('alreadyDownloaded')
        })*/
    }

    hideCollectionCarouselButton() {
        return this.totalPageCollection === 1;
    }

    getCurrentCollectionPage() {
        return this.currentCollectionPage
    }
}

export default HomeController