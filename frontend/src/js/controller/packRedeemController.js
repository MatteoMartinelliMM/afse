import navInstance from "@/js/utils/navigator";
import HttpInteractor from "@/js/utils/httpInteractor";

class PackRedeemController {
    constructor() {

    }

    getPack() {
        let params = navInstance.getQueryParams()
        console.log(`http://localhost:3000/shop/packRedeem?${params.toString()}`)
        this.packId = params.get('packId')
        return new Promise((resolve, reject) => {
            if (!params.get('packId')) {
                reject('noPrams')
                return;
            }
            new HttpInteractor().postAuthenticated('http://localhost:3000/shop/packReedem', {
                headers: {
                    'Content-Type': 'application/json' // Assicurati di specificare il Content-Type
                },
                body: JSON.stringify({packId: params.get('packId')}
                )
            }).then((json) => {
                this.cards = json
                this.cards.forEach(d => d.destinationArea = 'collection')
                console.log(JSON.stringify(json))
                resolve(this.cards);
            })
                .catch((e) => reject(e))
        })
    }

    onChangeArea(id, area) {
        const index = this.cards.findIndex(d => d.id === id);
        if (index !== -1)
            this.cards[index].destinationArea = area
        return index !== -1
    }

    canConfirmChoice() {
        return this.cards.filter(d => d.owned && d.destinationArea === 'collection').length === 0;
    }

    onConfirmCardsChoice() {
        return new Promise((resolve, reject) => {
            new HttpInteractor().postAuthenticated('http://localhost:3000/shop/cardsRedeem', {
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                        packId: this.packId,
                        collection: this.cards.filter(c => c.destinationArea === 'collection').map(c => ({
                            name: c.name,
                            figurineId: c.id
                        })),
                        discard: this.cards.filter(c => c.destinationArea === 'discard').map(c => ({
                            name: c.name,
                            figurineId: c.id
                        })),
                        trade: this.cards.filter(c => c.destinationArea === 'trade').map(c => ({
                            name: c.name,
                            figurineId: c.id
                        })),
                    }
                )
            }).then(_ => {
                console.log('ci arrivo')
                resolve();
            })
                .catch((e) => reject(e))
        })
    }
}

export default PackRedeemController