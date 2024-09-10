import HomeController from "../controller/homeController.js";
import navInstance from "../utils/navigator.js";
import {Carousel} from "bootstrap";

class HomeView {
    constructor() {
        this.homeController = new HomeController()
    }

    render() {
        console.log('render() home')
        let navBar = document.getElementById('navBar')
        navBar.classList.toggle('d-none', false)
        this.homeController.getUserInfo().then(user => {
            const userInfoContainer = document.getElementById('userInfoContainer')
            document.getElementById('mainLoaderContainer').classList.toggle('d-none', true)
            userInfoContainer.innerHTML += `<div class="col d-flex align-items-center">
                                                <img class="img-thumbnail rounded-circle profile-img"
                                                     src="${user.profilePicture}"
                                                     alt="${user.username}">
                                                <h3 class="ms-2">👋 ${user.username}</h3>
                                            </div>`
            const collectionContainer = document.getElementById('collectionContainer')
            collectionContainer.classList.toggle('d-none', false)
            this.#renderSection('collectionContainer')
            /*this.homeController.getUserCollection().then(cards => {

            }).catch(e => {
                if (e === 'networkError') {
                    document.getElementById('collectionLoaderContainer').classList.toggle('d-none', false)

                }
            })*/
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
                    this.#loadCollectionSection(section, data);
                    return;
                default:
                    return;
            }
        }).catch(e => {
            if (e === 'networkError') {
                this.#hideSectionLoader(section);
                document.getElementById(`${section}InnerContainer`).innerHTML += `<h2 class="text-center">Cannot load ${section}</h2>`
            }
        })
    }

    #loadCollectionSection(section, figurine) {
        const collectionCarousel = document.getElementById(`collectionCarousel`)
        collectionCarousel.classList.toggle('d-none', false)
        const carouselController = new Carousel(collectionCarousel)
        const carouselItemContainer = document.querySelector('.carousel-inner')
        const prevButton = document.querySelector('.carousel-control-prev');
        const nextButton = document.querySelector('.carousel-control-next');
        prevButton.classList.toggle('d-none', this.homeController.hideCollectionCarouselButton())
        nextButton.classList.toggle('d-none', this.homeController.hideCollectionCarouselButton())
        nextButton.addEventListener('click', () => {
            if (this.homeController.onCollectionNextPagePressed()) {
                const carouselItem = this.#createLoaderCarouselItem(carouselItemContainer)
                this.homeController.getUserCollection().then(figurine => {
                    this.#createFigurineCarouselItem(figurine, carouselItemContainer, carouselItem)
                }).catch(_ =>{
                    this.#createErrorCarouselItem(carouselController,carouselItem)
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
            cell.className = 'col col-md-3 col-lg-3 mt-4 d-flex justify-content-center text-center'
            cell.innerHTML = `
                        <div class="hero-card clickable">
                            <img src="${f.imageUrl}" alt="${f.name}" class="img-fluid">
                            <div class="hero-label ">
                                <span class="text-wrap text-break">${f.name}</span>
                            </div>
                        </div>
                `;
            cell.addEventListener('click', () => {
                navInstance.goTo('/hero', `?id=${f.figurineId}`)
                console.log(`clicked ${f.id}`)
            })
            row.appendChild(cell)
            index++
        })
        carouselItem.appendChild(row)
        carouselItemContainer.appendChild(carouselItem)
    }

    #createLoaderCarouselItem(carouselItemContainer) {
        const firstCarouselItem = document.getElementById('1CarouselItem');
        const firstItemHeight = firstCarouselItem ? firstCarouselItem.offsetHeight : 400;
        console.log('item height: ', firstItemHeight)
        const carouselItem = document.createElement('div')
        carouselItem.id = `${this.homeController.getCurrentCollectionPage()}CarouselItem`
        carouselItem.className = 'carousel-item'
        carouselItem.innerHTML = `<div class="container-fluid d-flex justify-content-center align-items-center" style="height: ${firstItemHeight}px">
                                    <div class="spinner-border text-danger " role="status"></div>
                                  </div>`
        carouselItemContainer.appendChild(carouselItem)
        return carouselItem
    }

    #createErrorCarouselItem(carouselItemContainer) {
        const firstCarouselItem = document.getElementById('1CarouselItem');
        const firstItemHeight = firstCarouselItem ? firstCarouselItem.offsetHeight : 400;
        console.log('item height: ', firstItemHeight)
        const carouselItem = document.createElement('div')
        carouselItem.id = `${this.homeController.getCurrentCollectionPage()}CarouselItem`
        carouselItem.className = 'carousel-item'
        carouselItem.innerHTML = `<div class="container-fluid d-flex justify-content-center align-items-center" style="height: ${firstItemHeight}px">
                                    <div>
                                        <img class="img-fluid" src="/assets/error.png" alt="error">
                                        <p class="text-muted text-center">Something went wrong</p>
                                    </div>
                                  </div>`
        carouselItemContainer.appendChild(carouselItem)
        return carouselItem
    }

    #hideSectionLoader(section) {
        document.getElementById(`${section}LoaderContainer`).classList.toggle('d-none', true)
    }
}

export default HomeView