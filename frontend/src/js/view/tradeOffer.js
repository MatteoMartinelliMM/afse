import TradeOfferController from "@/js/controller/tradeOfferController";
import {Modal} from 'bootstrap';

class TradeOfferView {
    constructor() {
        this.tradeOfferController = new TradeOfferController()
    }

    render() {
        console.log('render trade offer!')
        this.tradeOfferController.enterOnPage().then(data => {
            const exchangeableContainer = document.getElementById('exchangeableContainer')
            const offersContainer = document.getElementById('offersContainer')
            this.#fillArea(exchangeableContainer, data.exchangeable);
        }).catch(e => console.log(e))
    }

    #fillArea(container, cards) {
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
                             <div id="card${h.id}" class="hero-card">
                                <img src="${imageUrl}" alt="${h.name}" class="img-fluid">
                                <div class="hero-label overflow-auto">
                                    <span>${h.name}</span>
                                </div>
                                <div class="pippo position-absolute top-0 end-0 translate-middle mt-4 ms-3 p-2 text-white rounded-circle d-flex justify-content-center align-items-center">
                                    ${h.quantity}
                                </div>
                            </div>
                            <div class="row card-body justify-content-center">
                                 <div class="col d-flex justify-content-center">
                                     <button id="trade${h.id}" class="btn btn-outline-danger d-flex" type="button">
                                            Trade
                                     </button>
                                 </div> 
                            </div>
                        </div>
                        `
            row.appendChild(cell)
            index++
        })
        container.appendChild(row)
        cards.forEach(h => {
            document.getElementById(`trade${h.id}`).addEventListener('click', () => {
                console.log('tradeClick')
                this.tradeOfferController.onTradeCardSelected(h.id)
                const card = document.getElementById(`card${h.id}`)
                card.classList.remove('hero-card')
                card.classList.add('hero-card-disabled')
                document.getElementById(`trade${h.id}`).disabled = true
                this.#buildOfferView();
            })
        })
    }

    #buildOfferView() {
        const tradeOfferModel = this.tradeOfferController.tradeOfferModel
        document.getElementById('newOfferContainer').classList.toggle('d-none', false)
        const giveCardContainer = document.getElementById('giveCardContainer')
        const receiveCardContainer = document.getElementById('receiveCardContainer')
        let row = document.createElement('div')
        let index = 0
        row.className = 'row justify-content-center mt-3'
        giveCardContainer.innerHTML = ''
        tradeOfferModel.giveCards.forEach(id => {
            const card = this.tradeOfferController.getCardById(id)
            if (index % 3 === 0 && index !== 0) {
                giveCardContainer.appendChild(row)
                row = document.createElement('div')
                row.className = 'row justify-content-center mt-3'
            }
            const imageUrl = `${card.thumbnail.path}.${card.thumbnail.extension}`;
            const cell = document.createElement('div')
            cell.className = 'col'
            cell.innerHTML += `
                         <div class="hero-card">
                            <img src="${imageUrl}" alt="${card.name}" class="img-fluid">
                            <div class="hero-label overflow-auto">
                                <span>${card.name}</span>
                            </div>
                         </div>
                    `
            row.appendChild(cell)
            index++
        })
        giveCardContainer.appendChild(row)
        row = document.createElement('div')
        index = 0
        row.className = 'row justify-content-center'
        receiveCardContainer.innerHTML = ''
        tradeOfferModel.recieveCards.forEach(h => {
            if (index % 3 === 0 && index !== 0) {
                receiveCardContainer.appendChild(row)
                row = document.createElement('div')
                row.className = 'row justify-content-center'
            }
            const imageUrl = `${h.thumbnail.path}.${h.thumbnail.extension}`;
            const cell = document.createElement('div')
            cell.className = 'col'
            cell.innerHTML += `
                         <div class="hero-card">
                            <img src="${imageUrl}" alt="${h.name}" class="img-fluid">
                            <div class="hero-label overflow-auto">
                                <span>${h.name}</span>
                            </div>
                         </div>
                    `
            row.appendChild(cell)
            index++
        })
        receiveCardContainer.appendChild(row)
    }
}


export default TradeOfferView