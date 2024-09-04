import HttpInteractor from "@/js/utils/httpInteractor";
import navInstance from "../utils/navigator.js";

class AlbumController {
    constructor() {
    }

    async enterOnPage() {
        let params = navInstance.getQueryParams()
        let url = params.get('page') ? `http://localhost:3000/marvel/characters?${params.toString()}`
            : 'http://localhost:3000/marvel/characters'
        console.log(url)
        return new Promise((resolve, reject) => {
            new HttpInteractor().getAuthenticated(url)
                .then((json) => resolve(json))
                .catch((e) => reject(e))
        })

    }
}

export default AlbumController