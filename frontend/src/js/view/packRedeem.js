import PackRedeemController from "@/js/controller/packRedeemController";
import navInstance from "@/js/utils/navigator";

class PackRedeem {
    constructor() {
        this.packRedeemController = new PackRedeemController()
    }

    render() {
        this.packRedeemController.getPack().then(data => {
            document.getElementById('loaderContainer').classList.toggle('d-none', true)
            document.getElementById('packMainContainer').classList.toggle('d-none', false)
            document.getElementById('confirmBtn').disabled = !this.packRedeemController.canConfirmChoice()
            document.getElementById('confirmBtn').addEventListener('click', () =>
                this.packRedeemController.onConfirmCardsChoice()
                    .then(r => navInstance.goToAndReplace('/shop'))
                    .catch(e => console.log(e)))
            this.#fillAllAreas(data)
        }).catch(e => console.log(e))
    }

    #fillAllAreas(data) {
        const packContainer = document.getElementById('packContainer')
        const tradeContainer = document.getElementById('tradeContainer')
        const discardContainer = document.getElementById('discardContainer')
        this.#fillDestinationArea(tradeContainer, data.filter(h => h.destinationArea === 'trade'), 'trade')
        this.#fillDestinationArea(packContainer, data.filter(h => h.destinationArea === 'collection'), 'collection')
        this.#fillDestinationArea(discardContainer, data.filter(h => h.destinationArea === 'discard'), 'discard')
    }

    #fillDestinationArea(container, cards, type) {
        container.innerHTML = `<div class="col text-center">
                                    <div class="marvel-label">
                                        <h1 class="pt-3">${type.toUpperCase()}</h1>
                                    </div>
                                </div>
                              `
        let row = document.createElement('div')
        let index = 0
        row.className = 'row justify-content-center'
        cards.forEach(h => {
            if (index % 4 === 0 && index !== 0) {
                console.log('entro qua')
                container.appendChild(row)
                row = document.createElement('div')
                row.className = 'row justify-content-center'
            }
            const imageUrl = `${h.thumbnail.path}.${h.thumbnail.extension}`;
            const cell = document.createElement('div')
            cell.className = 'col-lg-3 col-md-3 col-sm-6 col-xs-9 mt-4 d-flex justify-content-center text-center'
            cell.innerHTML += `
                        <div class="card" style="width: 18rem;">
                             <div class="hero-card">
                                <img src="${imageUrl}" alt="${h.name}" class="img-fluid">
                                
                                <div class="hero-label overflow-auto">
                                    <span>${h.name}</span>
                                </div>
                            </div>
                            <div class="row card-body ${!h.owned ? 'd-none' : ''} justify-content-center">
                                 <div class="col d-flex ms-4 ${type === 'discard' ? 'd-none' : ''}">
                                     <button id="discard${h.id}" class="btn btn-outline-danger d-flex" type="button">
                                        <span class="mini-coin d-flex">
                                                <span class="mini-coin-inner"></span>
                                        </span>
                                            Discard
                                     </button>
                                 </div> 
                                  <div class="col d-flex ms-4 ${type === 'trade' ? 'd-none' : ''}">
                                     <button id="trade${h.id}" class="btn btn-outline-danger" type="button">
                                        Trade
                                     </button
                                 </div>
                            </div>
                        </div>
                        `
            row.appendChild(cell)
            index++
        })
        container.appendChild(row)
        cards.forEach(h => {
            document.getElementById(`discard${h.id}`).addEventListener('click', () => {
                if (this.packRedeemController.onChangeArea(h.id, 'discard')) {
                    this.#fillAllAreas(this.packRedeemController.cards)
                    document.getElementById('confirmBtn').disabled = !this.packRedeemController.canConfirmChoice()
                }
            })
            document.getElementById(`trade${h.id}`).addEventListener('click', () => {
                if (this.packRedeemController.onChangeArea(h.id, 'trade')) {
                    this.#fillAllAreas(this.packRedeemController.cards)
                    document.getElementById('confirmBtn').disabled = !this.packRedeemController.canConfirmChoice()
                }
            })
        })
    }

}

export default PackRedeem