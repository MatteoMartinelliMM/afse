import HomeController from "../controller/homeController.js";
import navInstance from "../utils/navigator.js";
import {Carousel} from "bootstrap";
import {main} from "@popperjs/core";
import {setNavbarItemActive} from "@/js/components/navbar";

class HomeView {
    constructor() {
        this.homeController = new HomeController()
    }

    render() {
        console.log('render() home')
        document.getElementById('navBar').classList.toggle('d-none', false)
        setNavbarItemActive('home')
        this.homeController.getUserInfo().then(user => {
            document.getElementById('mainLoaderContainer').classList.toggle('d-none', true)
            const collectionContainer = document.getElementById('collectionContainer')
            collectionContainer.classList.toggle('d-none', false)
            this.#loadUserInfo(user)
            this.#renderSection('collectionContainer')
            this.#renderSection('recentPacksContainer')
            this.#renderSection('recentDealsContainer')
        }).catch(e => {
            console.log(e)
        })
    }

    #renderSection(containerId) {
        const section = containerId.replace(/Container$/, "");
        const mainSectionContainer = document.getElementById(containerId)
        mainSectionContainer.classList.toggle('d-none', false)
        this.homeController.loadSection(section).then(data => {
            this.#hideSectionLoader(section)
            switch (section) {
                case 'collection':
                    this.#loadCollectionSection(mainSectionContainer, section, data);
                    return;
                case 'recentPacks':
                    this.#loadRecentPackSection(mainSectionContainer, section, data)
                    return;
                case 'recentDeals':
                    this.#loadRecentDeals(mainSectionContainer, section, data)
                    return;
                default:
                    return;
            }
        }).catch(e => {
            console.log(e)
            this.#hideSectionLoader(section);
            if (document.getElementById(`${section}InnerContainer`))
                document.getElementById(`${section}InnerContainer`).innerHTML += `<h2 class="text-center">Cannot load ${section.camelCaseToSpaces()}.</h2>`
        })
    }

    #loadUserInfo(user) {
        const userInfoContainer = document.getElementById('userInfoContainer')
        userInfoContainer.innerHTML = ''
        const col = document.createElement('div')
        col.className = 'col d-flex align-items-center'
        const userImg = document.createElement('img')
        userImg.className = 'img-thumbnail rounded-circle profile-img clickable'
        userImg.src = user.profilePicture
        userImg.alt = user.username
        col.appendChild(userImg)
        const h3 = document.createElement('h3')
        h3.className = 'ms-2'
        h3.innerHTML = `👋 ${user.username}`
        col.appendChild(h3)
        userInfoContainer.appendChild(col)
        userImg.addEventListener('click', () => navInstance.goTo('/profile'))
    }

    #loadCollectionSection(container, section, figurine) {
        if (figurine.length === 0) {
            const h2 = document.createElement('h2');
            h2.className = 'text-center'
            const textNode = document.createTextNode("You don't have any figurines in your collection, ");
            const link = document.createElement('a');
            link.href = '/album';
            link.textContent = 'watch the collection here.';
            h2.appendChild(textNode);
            h2.appendChild(link);
            container.appendChild(h2)
            return;
        }
        const collectionCarousel = document.getElementById(`collectionCarousel`)
        collectionCarousel.classList.toggle('d-none', false)
        const carouselController = new Carousel(collectionCarousel)
        const carouselItemContainer = document.getElementById('collectionInnerCarousel')
        const prevButton = document.querySelector('.carousel-control-prev');
        const nextButton = document.querySelector('.carousel-control-next');
        prevButton.classList.toggle('d-none', this.homeController.hideCollectionCarouselButton())
        nextButton.classList.toggle('d-none', this.homeController.hideCollectionCarouselButton())
        nextButton.addEventListener('click', () => {
            if (this.homeController.onCollectionNextPagePressed()) {
                const carouselItem = this.#createLoaderCarouselItem(carouselItemContainer)
                this.homeController.getUserCollection().then(figurine => {
                    this.#createFigurineCarouselItem(figurine, carouselItemContainer, carouselItem)
                }).catch(_ => {
                    this.#createErrorCarouselItem(carouselController, carouselItem)
                })
            }
            carouselController.next()
        });

        prevButton.addEventListener('click', () => {
            if (this.homeController.onCollectionPreviousPagePressed()) {
                const carouselItem = this.#createLoaderCarouselItem(carouselItemContainer)
                this.homeController.getUserCollection().then(figurine => {
                    this.#createFigurineCarouselItem(figurine, carouselItemContainer, carouselItem)
                })
            }
            carouselController.prev()
        });
        const carouselItem = document.createElement('div')
        carouselItem.id = `${this.homeController.getCurrentCollectionPage()}CarouselItem`
        carouselItem.className = 'carousel-item active'
        this.#createFigurineCarouselItem(figurine, carouselItemContainer, carouselItem);
    }

    #createFigurineCarouselItem(figurine, carouselItemContainer, carouselItem) {
        carouselItem.innerHTML = ''
        carouselItem.setAttribute('data-page', this.homeController.getCurrentCollectionPage())
        let index = 0
        let row = document.createElement('div')
        row.className = 'row justify-content-center'
        figurine.forEach(f => {
            if (index % 3 === 0 && index !== 0) {
                carouselItem.appendChild(row)
                row = document.createElement('div')
                row.className = 'row justify-content-center'
            }
            const cell = document.createElement('div')
            cell.className = 'col col-md-3 col-lg-3 mt-4 mb-2 d-flex justify-content-center'
            cell.innerHTML = `
                        <div class="hero-card clickable">
                            <img src="${f.imageUrl}" alt="${f.name}" class="img-fluid">
                            <div class="hero-label ">
                                <span class="text-wrap text-break">${f.name}</span>
                            </div>
                        </div>
                `;
            cell.addEventListener('click', () => navInstance.goTo('/hero', `?id=${f.figurineId}`))
            row.appendChild(cell)
            index++
        })
        carouselItem.appendChild(row)

        this.#insertItemInOrder(carouselItemContainer, carouselItem, this.homeController.getCurrentCollectionPage())
        //carouselItemContainer.appendChild(carouselItem)
    }

    #insertItemInOrder(carouselItemContainer, item, page) {
        const items = Array.from(carouselItemContainer.children);
        const index = items.findIndex(i => parseInt(i.dataset.page) > page);
        index === -1 ? carouselItemContainer.appendChild(item) : carouselItemContainer.insertBefore(item, items[index])
    }

    #createLoaderCarouselItem(carouselItemContainer) {
        const firstCarouselItem = document.getElementById('1CarouselItem');
        const firstItemHeight = firstCarouselItem ? firstCarouselItem.offsetHeight : 400;
        const carouselItem = document.createElement('div')
        carouselItem.setAttribute('data-page', this.homeController.getCurrentCollectionPage())
        carouselItem.id = `${this.homeController.getCurrentCollectionPage()}CarouselItem`
        carouselItem.className = 'carousel-item'
        carouselItem.innerHTML = `<div class="container-fluid d-flex justify-content-center align-items-center" style="height: ${firstItemHeight}px">
                                    <div class="spinner-border text-danger " role="status"></div>
                                  </div>`
        this.#insertItemInOrder(carouselItemContainer, carouselItem, this.homeController.getCurrentCollectionPage())
        return carouselItem
    }

    #createErrorCarouselItem(carouselItemContainer) {
        const firstCarouselItem = document.getElementById('1CarouselItem');
        const firstItemHeight = firstCarouselItem ? firstCarouselItem.offsetHeight : 400;
        console.log('item height: ', firstItemHeight)
        const carouselItem = document.createElement('div')
        carouselItem.setAttribute('data-page', this.homeController.getCurrentCollectionPage())
        carouselItem.id = `${this.homeController.getCurrentCollectionPage()}CarouselItem`
        carouselItem.className = 'carousel-item'
        carouselItem.innerHTML = `<div class="container-fluid d-flex justify-content-center align-items-center" style="height: ${firstItemHeight}px">
                                    <div>
                                        <img class="img-fluid" src="/assets/error.png" alt="error">
                                        <p class="text-muted text-center">Something went wrong</p>
                                    </div>
                                  </div>`
        this.#insertItemInOrder(carouselItemContainer, carouselItem, this.homeController.getCurrentCollectionPage())
        return carouselItem
    }

    #hideSectionLoader(section) {
        if (document.getElementById(`${section}LoaderContainer`))
            document.getElementById(`${section}LoaderContainer`).classList.toggle('d-none', true)
    }

    #loadRecentPackSection(container, section, packs) {
        if (packs.length === 0) {
            const h2 = document.createElement('h2');
            h2.className = 'text-center'
            const textNode = document.createTextNode("You don't have any figurines in your collection, ");
            const link = document.createElement('a');
            link.href = '/shop';
            link.textContent = 'buy packs here.';
            h2.appendChild(textNode);
            h2.appendChild(link);
            container.appendChild(h2)
            return;
        }
        const recentPackCarousel = document.getElementById(`recentPacksCarousel`)
        recentPackCarousel.classList.toggle('d-none', false)
        const carouselController = new Carousel(recentPackCarousel, {interval: 5000, ride: 'carousel'})
        const carouselItemContainer = document.getElementById('recentPacksInnerCarousel')
        let carouselItem = document.createElement('div')
        carouselItem.id = `0CarouselItem`
        carouselItem.className = 'carousel-item active'

        let index = 0
        packs.forEach(p => {
            if (index !== 0) {
                carouselItem = document.createElement('div')
                carouselItem.id = `${index}CarouselItem`
                carouselItem.className = 'carousel-item'
            }
            let row = document.createElement('div')
            row.className = 'row justify-content-center my-2'
            row.innerHTML += `<div class="col d-flex align-items-center">
                                <img class="img-thumbnail rounded-circle profile-img"
                                     src="${p.packName === 'Common Pack' ? '/assets/common_pack.png' : '/assets/special_pack.png'}"
                                     alt="${p.packName}">
                                <h4 class="ms-2">${p.packName}</h4>
                              </div>`
            carouselItem.appendChild(row)
            row = document.createElement('div')
            row.className = 'row justify-content-center my-2'
            let itemIndex = 0
            p.figurines.forEach(f => {
                if (itemIndex % 5 === 0 && index !== 0) {
                    row = document.createElement('div')
                    row.className = 'row justify-content-center my-2'
                    carouselItem.appendChild(row)
                }
                const col = document.createElement('div')
                col.className = `col-4 col-lg-2`
                const hero = document.createElement('div')
                hero.className = `hero-card ${f.owned ? 'clickable' : 'disabled'} mb-3 mb-lg-0`
                hero.innerHTML += `<img src="${f.imageUrl}" alt="${f.name}" class="img-fluid">
                                  <div class="hero-label">
                                    <span class="text-wrap text-break">${f.name}</span>
                                  </div>`
                hero.addEventListener('click', () => navInstance.goTo('/hero', `?id=${f.id}`))
                col.appendChild(hero)
                row.appendChild(col)
                itemIndex++
            })
            carouselItem.appendChild(row)
            carouselItemContainer.appendChild(carouselItem)
            index++
        })
    }

    #loadRecentDeals(container, section, deals) {
        if (deals.length === 0) {
            const h2 = document.createElement('h2');
            h2.className = 'text-center'
            const textNode = document.createTextNode("No one had make a deal, ");
            const link = document.createElement('a');
            link.href = '/trades';
            link.textContent = 'be the first one!';
            h2.appendChild(textNode);
            h2.appendChild(link);
            container.appendChild(h2)
            return;
        }
        const recentDealsCarousel = document.getElementById(`recentDealsCarousel`)
        recentDealsCarousel.classList.toggle('d-none', false)
        const carouselController = new Carousel(recentDealsCarousel, {interval: 5000, ride: 'carousel'})
        const carouselItemContainer = document.getElementById('recentDealsInnerCarousel')
        let carouselItem = document.createElement('div')
        carouselItem.id = `0CarouselItem`
        carouselItem.className = 'carousel-item active'
        deals.forEach(d => {
            let row = document.createElement('div')
            row.className = 'row justify-content-center my-2'
            row.innerHTML += `<div class="col d-flex align-items-center">
                                <img class="img-thumbnail rounded-circle profile-img"
                                     src="${d.bidderImage ? d.bidderImage : '/assets/user.png'}"
                                     alt="${d.bidderUsername}">
                                <h4 class="ms-2">${d.bidderUsername} have received:</h4>
                              </div>`
            carouselItem.appendChild(row)

            row = document.createElement('div')
            row.className = 'row justify-content-center'
            this.#createTradesCarouselItem(d.receiveCard, carouselItem, row)

            row = document.createElement('div')
            row.className = 'row justify-content-center my-2'
            row.innerHTML += `<div class="col d-flex align-items-center">
                                <img class="img-thumbnail rounded-circle profile-img"
                                     src="${d.receiverImage ? d.receiverImage : '/assets/user.png'}"
                                     alt="${d.receiverUsername}">
                                <h4 class="ms-2">${d.receiverUsername} have received:</h4>
                              </div>`

            carouselItem.appendChild(row)
            row = document.createElement('div')
            row.className = 'row justify-content-center'
            this.#createTradesCarouselItem(d.giveCard, carouselItem, row)

            carouselItemContainer.appendChild(carouselItem)
        })
    }

    #createTradesCarouselItem(list, carouselItem, row) {
        let index = 0
        list.forEach(c => {
            if (index % 3 === 0 && index !== 0) {
                carouselItem.appendChild(row)
                row = document.createElement('div')
                row.className = 'row justify-content-center'
            }
            const cell = document.createElement('div')
            cell.className = 'col col-md-3 col-lg-3 d-flex justify-content-center'
            cell.innerHTML = `
                        <div class="hero-card">
                            <img src="${c.imageUrl}" alt="${c.name}" class="img-fluid">
                            <div class="hero-label ">
                                <span class="text-wrap text-break">${c.name}</span>
                            </div>
                        </div>
                `;
            row.appendChild(cell)
            index++
        })
        carouselItem.appendChild(row)
    }
}

export default HomeView