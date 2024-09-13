import TradesController from "../controller/tradesController.js";
import navInstance from "../utils/navigator.js";
import Masonry from 'masonry-layout/masonry';
import {attachListners} from "@/js/navbar";


class TradesView {
    constructor() {
        this.tradesControler = new TradesController()
    }

    render() {
        console.log('render trades!')
        attachListners()
        this.tradesControler.getTrades().then(data => {
            document.getElementById('othersOffer').classList.toggle('d-none', false)
            document.getElementById('yourOffer').classList.toggle('d-none', false)
            this.createOfferGrid(data.othersOffers, 'othersOfferContainer')
            this.createOfferGrid(data.userOffers, 'userOfferContainer', true)
            console.log(JSON.stringify(data))
        })
    }

    createOfferGrid(offers, containerId, currentUser = false) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear existing content
        if (offers && offers.length !== 0) {
            offers.forEach(offer => {
                const offerElement = document.createElement('div');
                offerElement.className = 'col-12 col-md-6'
                const card = document.createElement('div')
                card.className = 'card'
                if (!currentUser)
                    card.innerHTML += this.#userProfile(offer)
                card.appendChild(this.#offerContent(offer, currentUser))
                card.innerHTML += this.#actionButton(offer, currentUser)
                offerElement.appendChild(card);
                container.appendChild(offerElement)

                document.getElementById(`action${offer._id}`).addEventListener('click', () => {
                    this.tradesControler.onActionButtonPressed(offer._id, currentUser).then(data => {
                        if(currentUser){
                            this.createOfferGrid(data, 'userOfferContainer', true)
                            return;
                        }
                        this.createOfferGrid(data.othersOffers, 'othersOfferContainer')
                    }).catch(e => console.log(e))
                    console.log('click bottone')
                })
            });
            new Masonry(container, {
                itemSelector: '.col-12.col-md-6',
                percentPosition: true
            });
            document.getElementById('loaderContainer').classList.toggle('d-none', true)
            return
        }
        document.getElementById('loaderContainer').classList.toggle('d-none', true)
        if(currentUser){
            container.innerHTML = `<h2 class="text-center">YOU HAVE NOT CREATED ANY TRADE OFFERS</h2>`
            const h3 = document.createElement('h3');
            h3.className = 'text-center'
            const textNode = document.createTextNode("CREATE ONE ");
            const link = document.createElement('a');
            link.href = '/tradeOffer';
            link.textContent = 'HERE';
            h3.appendChild(textNode);
            h3.appendChild(link);
            container.appendChild(h3)
            return
        }
        container.innerHTML = `<h2 class="text-center">NO TRADE OFFERS AVAILABLE</h2>`
    }

    #userProfile(offer) {
        return `<div class="card-header">
                    <div class="d-flex align-items-center">
                        <img class="img-thumbnail rounded-circle profile-img"
                             src="${offer.bidderProfilePicture}"
                             alt="${offer.bidderUsername}">
                        <h3 class="ms-2">${offer.bidderUsername}</h3>
                    </div>
                </div>`
    }

    #offerContent(offer, currentUser) {
        const cardBody = document.createElement('div')
        cardBody.className = 'card-body'
        const row = document.createElement('row')
        row.className = 'row'
        row.appendChild(this.#giveContent(row, offer.giveCard, currentUser));
        row.appendChild(this.#wantContent(row, offer.receiveCard, currentUser));
        cardBody.appendChild(row)
        return cardBody
    }

    #giveContent(row, cards, currentUser) {
        const col = document.createElement('div')
        col.className = 'col'
        col.innerHTML += `<h4 class="text-center">OFFER</h4>`
        cards.forEach(h => {
            const imageUrl = `${h.thumbnail.path}.${h.thumbnail.extension}`;
            col.innerHTML += `
                        <div class="hero-card ${!currentUser && h.owned ? 'disabled' : ''} mb-2">
                            <img src="${imageUrl}" alt="${h.name}" class="img-fluid">
                            <div class="hero-label overflow-auto">
                                <span>${h.name}</span>
                            </div>
                            <div class="position-absolute top-50 start-50 translate-middle text-white ${currentUser || !h.owned ? 'd-none' : ''}">
                                <h1 class="text-stroke">OWNED</h1>
                            </div>
                        </div>
                `;
        })
        return col

    }

    #wantContent(row, cards, currentUser) {
        const col = document.createElement('div')
        col.className = 'col'
        col.innerHTML += `<h4 class="text-center">WANT</h4>`
        cards.forEach(h => {
            const imageUrl = `${h.thumbnail.path}.${h.thumbnail.extension}`;
            col.innerHTML += `
                        <div class="hero-card mb-2 ${!currentUser && !h.owned ? 'disabled' : ''}">
                            <img src="${imageUrl}" alt="${h.name}" class="img-fluid">
                            <div class="hero-label overflow-auto">
                                <span>${h.name}</span>
                            </div>
                        </div>
                `;
        })
        return col

    }

    #actionButton(offer, currentUser) {
        if (currentUser)
            return `<div class="card-footer">
                    <button id="action${offer._id}" class="btn btn-outline-danger w-100">DELETE OFFER</button>
                </div>`

        return `<div class="card-footer">
                    <button id="action${offer._id}" class="btn btn-outline-danger w-100" ${!this.tradesControler.cannotAcceptOffer(offer) ? 'disabled' : ''}>ACCEPT OFFER</button>
                </div>`
    }


}

export default TradesView