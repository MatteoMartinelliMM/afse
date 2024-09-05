import TradeOfferController from "@/js/controller/tradeOfferController";
import {Modal} from 'bootstrap';
import {debounce} from "@/js/utils/viewUtils";

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
                                <div class="overflow-chip position-absolute top-0 end-0 translate-middle mt-4 ms-3 p-2 text-white rounded-circle d-flex justify-content-center align-items-center">
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
                card.classList.add('disabled')
                document.getElementById(`trade${h.id}`).disabled = true
                this.#buildOfferView();
            })
        })
    }

    #buildOfferView() {
        const tradeOfferModel = this.tradeOfferController.tradeOfferModel
        if (tradeOfferModel.giveCards.length === 0) {
            document.getElementById('newOfferContainer').classList.toggle('d-none', true)
            return;
        }
        document.getElementById('confirmBtn')
            .addEventListener('click', () =>
                this.tradeOfferController.confirmNewOffer()
                    .then(_ => this.#buildOfferView())
                    .catch(e => console.log(e)))
        const heroAutoComplete = document.getElementById('autocomplete')
        const suggestionBox = document.getElementById('autocomplete-list');
        const suggestionTemplate = document.getElementById('suggestion-template');
        heroAutoComplete.addEventListener('input', () => {
            const query = heroAutoComplete.value;
            if (query.length < 3) {
                suggestionBox.innerHTML = '';
                return;
            }
            debounce(() => {
                console.log(query)
                document.getElementById('autoCompleteLoader').classList.toggle('d-none', false)
                this.tradeOfferController.onSearchingReceivingCardName(query)
                    .then((data) => {
                        console.log(data)
                        document.getElementById('autoCompleteLoader').classList.toggle('d-none', true)
                        suggestionBox.innerHTML = '';
                        data.forEach(result => {
                            const clone = suggestionTemplate.content.cloneNode(true);
                            const suggestion = clone.querySelector('.autocomplete-suggestion');
                            clone.querySelector('.avatar').src = `${result.thumbnail.path}.${result.thumbnail.extension}`
                            clone.querySelector('.name').innerHTML = result.name

                            suggestionBox.appendChild(clone)

                            suggestion.addEventListener('click', () => {
                                console.log(JSON.stringify(result))
                                this.tradeOfferController.onReceiveCardSelected(result)
                                heroAutoComplete.value = ''
                                suggestionBox.innerHTML = ''
                                this.#buildOfferView()
                            });
                            suggestionBox.appendChild(suggestion);
                        });
                    })
                    .catch(() => suggestionBox.innerHTML = '')
            })
        })
        document.getElementById('newOfferContainer').classList.toggle('d-none', false)
        const giveCardContainer = document.getElementById('giveCardContainer')
        const receiveCardContainer = document.getElementById('receiveCardContainer')
        let row = document.createElement('div')
        let index = 0
        row.className = 'row justify-content-center mt-4'
        giveCardContainer.innerHTML = ''
        tradeOfferModel.giveCards.forEach(id => {
            const card = this.tradeOfferController.getCardById(id)
            if (index % 3 === 0 && index !== 0) {
                giveCardContainer.appendChild(row)
                row = document.createElement('div')
                row.className = 'row justify-content-center mt-4'
            }
            const imageUrl = `${card.thumbnail.path}.${card.thumbnail.extension}`;
            const cell = document.createElement('div')
            cell.className = 'col-12 col-md-4 mb-3 mb-md-0'
            cell.innerHTML += `
                         <div class="hero-card">
                            <img src="${imageUrl}" alt="${card.name}" class="img-fluid">
                            <div class="hero-label overflow-auto">
                                <span>${card.name}</span>
                            </div>
                            <div id="chip${card.id}" class="overflow-chip clickable position-absolute top-0 end-0 translate-middle mt-4h ms-3 p-2 text-white rounded-circle d-flex justify-content-center align-items-center">
                               <svg class="mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" fill="none" x="0px" y="0px">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.69292 18.3071C5.30239 17.9166 5.30239 17.2834 5.69292 16.8929L16.8929 5.69292C17.2834 5.30239 17.9166 5.30239 18.3071 5.69292C18.6977 6.08344 18.6977 6.71661 18.3071 7.10713L7.10713 18.3071C6.71661 18.6977 6.08344 18.6977 5.69292 18.3071Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.69292 5.69292C6.08344 5.30239 6.71661 5.30239 7.10713 5.69292L18.3071 16.8929C18.6977 17.2834 18.6977 17.9166 18.3071 18.3071C17.9166 18.6977 17.2834 18.6977 16.8929 18.3071L5.69292 7.10713C5.30239 6.71661 5.30239 6.08344 5.69292 5.69292Z" fill="white"/>
                               </svg>
                            </div>
                         </div>
                    `
            row.appendChild(cell)
            index++
        })
        giveCardContainer.appendChild(row)
        tradeOfferModel.giveCards.forEach(id => {
            document.getElementById(`chip${id}`).addEventListener('click', () => {
                this.tradeOfferController.onTradeCardRemoved(id)
                const card = document.getElementById(`card${id}`)
                card.classList.remove('disabled')
                document.getElementById(`trade${id}`).disabled = false
                this.#buildOfferView();
            })
        })
        row = document.createElement('div')
        index = 0
        row.className = 'row justify-content-center mt-2'
        receiveCardContainer.innerHTML = ''
        tradeOfferModel.recieveCards.forEach(h => {
            if (index % 3 === 0 && index !== 0) {
                receiveCardContainer.appendChild(row)
                row = document.createElement('div')
                row.className = 'row justify-content-center mt-2'
            }
            const imageUrl = `${h.thumbnail.path}.${h.thumbnail.extension}`;
            const cell = document.createElement('div')
            cell.className = 'col-4'
            cell.innerHTML += `
                         <div class="hero-card">
                            <img src="${imageUrl}" alt="${h.name}" class="img-fluid">
                            <div class="hero-label overflow-auto">
                                <span>${h.name}</span>
                            </div>
                            <div id="chip${h.id}" class="overflow-chip clickable position-absolute top-0 end-0 translate-middle mt-4h ms-3 p-2 text-white rounded-circle d-flex justify-content-center align-items-center">
                               <svg class="mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" fill="none" x="0px" y="0px">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.69292 18.3071C5.30239 17.9166 5.30239 17.2834 5.69292 16.8929L16.8929 5.69292C17.2834 5.30239 17.9166 5.30239 18.3071 5.69292C18.6977 6.08344 18.6977 6.71661 18.3071 7.10713L7.10713 18.3071C6.71661 18.6977 6.08344 18.6977 5.69292 18.3071Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.69292 5.69292C6.08344 5.30239 6.71661 5.30239 7.10713 5.69292L18.3071 16.8929C18.6977 17.2834 18.6977 17.9166 18.3071 18.3071C17.9166 18.6977 17.2834 18.6977 16.8929 18.3071L5.69292 7.10713C5.30239 6.71661 5.30239 6.08344 5.69292 5.69292Z" fill="white"/>
                               </svg>
                            </div>
                         </div>
                    `
            row.appendChild(cell)
            index++
        })
        receiveCardContainer.appendChild(row)
        tradeOfferModel.recieveCards.forEach(h => {
            document.getElementById(`chip${h.id}`).addEventListener('click', () => {
                this.tradeOfferController.onReceiveCardRemoved(h)
                this.#buildOfferView();
            })
        })
    }
}


export default TradeOfferView