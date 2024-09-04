import HttpInteractor from "@/js/utils/httpInteractor";
import navInstance from "@/js/utils/navigator";

class HeroController {
    constructor() {
        this.detailsDownloaded = new Map()
    }

    getHeroInfo() {
        let params = navInstance.getQueryParams()
        console.log(`http://localhost:3000/marvel/character?${params.toString()}`)
        return new Promise((resolve, reject) => {
            if (!params.get('id')) {
                reject('noPrams')
                return;
            }
            new HttpInteractor().getAuthenticated(`http://localhost:3000/marvel/character?${params.toString()}`)
                .then((json) => {
                    console.log(JSON.stringify(json))
                    resolve(json);
                })
                .catch((e) => reject(e))
        })
    }

    getHeroDetails(url, id) {

        return new Promise((resolve, reject) => {
            if (!url) {
                reject('noPrams')
                return;
            }
            console.log(`http://localhost:3000/marvel/heroDetail?path=${url}`)
            new HttpInteractor().getAuthenticated(`http://localhost:3000/marvel/heroDetail?path=${url}`)
                .then((json) => {
                    this.detailsDownloaded.set(id, true)
                    console.log(JSON.stringify(json))
                    resolve(json);
                })
                .catch((e) => reject(e))
        })
    }

    shouldDownloadDetails(id) {
        return !this.detailsDownloaded.has(id);
    }
}

export default HeroController