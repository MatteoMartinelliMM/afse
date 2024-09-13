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
            case 'recentPacks':
                return this.getRecentPacks();
            case 'recentDeals':
                return this.getRecentDeals();
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
        console.log('before onCollectionNextPagePressed(): ' , this.currentCollectionPage)
        this.currentCollectionPage + 1 <= this.totalPageCollection ? ++this.currentCollectionPage : this.currentCollectionPage = 1
        console.log('after onCollectionNextPagePressed(): ' , this.currentCollectionPage)
        return this.collectionPageDownloaded.findIndex(page => page === this.currentCollectionPage) === -1
    }

    onCollectionPreviousPagePressed() {
        console.log('before onCollectionPreviousPagePressed(): ' , this.currentCollectionPage)
        this.currentCollectionPage - 1 !== 0 ? --this.currentCollectionPage : this.currentCollectionPage = this.totalPageCollection
        console.log('after onCollectionPreviousPagePressed(): ' , this.currentCollectionPage)
        return this.collectionPageDownloaded.findIndex(page => page === this.currentCollectionPage) === -1
    }

    hideCollectionCarouselButton() {
        return this.totalPageCollection === 1;
    }

    getCurrentCollectionPage() {
        return this.currentCollectionPage
    }

    getRecentDeals() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated(`http://localhost:3000/home/recentDeals`)
                .then(deals => {
                    resolve(deals)
                })
                .catch(e => {
                    console.log(e)
                    reject('networkError')
                })
        })
    }

    getRecentPacks() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated(`http://localhost:3000/home/openedPacks`)
                .then(packs => {
                    resolve(packs)
                })
                .catch(e => {
                    console.log(e)
                    reject('networkError')
                })
        })
    }
}

export default HomeController