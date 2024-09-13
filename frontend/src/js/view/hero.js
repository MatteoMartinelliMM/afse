import HeroController from "../controller/heroController.js";
import navInstance from "../utils/navigator.js";

class HeroView {
    constructor() {
        this.heroController = new HeroController()
    }

    render() {
        console.log('render() home')
        this.heroController.getHeroInfo().then((data) => {
            document.getElementById('loaderContainer').classList.toggle('d-none', true)
            document.getElementById('heroContainer').classList.toggle('d-none', false)
            console.log(data)
            document.getElementById('name').innerHTML = data.name
            document.getElementById('heroImg').src = `${data.thumbnail.path}.${data.thumbnail.extension}`
            document.getElementById('description').innerHTML = data.description
            /*document.getElementById('figurineQuantity').innerHTML = data.figurineLevel
            document.getElementById('figurineLevel').innerHTML = `${data.figurineLevel}★`*/
            const seriesContainer = document.getElementById('seriesContainer')
            const eventsContainer = document.getElementById('eventsContainer')
            const comicsContainer = document.getElementById('comicsContainer')
            this.#createCollapseItems(seriesContainer, data.series.items)
            this.#createCollapseItems(eventsContainer, data.events.items)
            this.#createCollapseItems(comicsContainer, data.comics.items)
        })

    }

    #createCollapseItems(container, items) {
        if (items.length === 0) {
            container.classList.toggle('d-none', true)
            return;
        }
        items.forEach(s => {
            container.innerHTML += `
                         <div class="row">
                            <div class="col">
                                <p class="pt-3">
                                    <a id="id${s.id}" class="btn btn-outline-danger" data-bs-toggle="collapse" href="#collapse${s.id}" role="button" aria-expanded="false"
                                       aria-controls="collapse${s.id}">
                                        ${s.name}
                                    </a>
                                </p>
                                <div class="collapse" id="collapse${s.id}">
                                    <div id="content${s.id}" class="card card-body">
                                        <div id="loaderContainer${s.id}" class="container-fluid d-flex justify-content-center align-items-center">
                                             <div id="loader" class="spinner-border text-danger" role="status"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>`;
            console.log('creo listner per: ', `id${s.id}`)
        })
        items.forEach(s => {
            document.getElementById(`id${s.id}`).addEventListener('click', () => {
                console.log('click di: ', `id${s.id}`)
                if (!this.heroController.shouldDownloadDetails(s.id)) return;
                this.heroController.getHeroDetails(s.resourceURI, s.id).then(data => {
                    const contentContainer = document.getElementById(`content${s.id}`)
                    contentContainer.innerHTML = ''
                    const imgUrl = `${data.thumbnail.path}.${data.thumbnail.extension}`
                    contentContainer.innerHTML = ` <div class="row">
                        <div class="col">
                            <img src="${imgUrl}" alt="${data.title}"
                                 class="img-fluid">
                        </div>
                        <div class="col">
                            <div class="col ml-lg-5">
                                <h1>${data.title}</h1>
                                <h4>${data.description}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="row pt-2">
                        <div class="col">
                            <div class="marvel-label">
                                <h4 class="pt-3">CHARACTERS</h4>
                            </div>
                            <ol id="character${data.id}" class="list-group list-group-numbered"
                            </ol>
                        </div>
                    </div>
                    <div class="row pt-2">
                        <div class="col">
                            <div class="marvel-label">
                                <h4 class="pt-3">CREATORS</h4>
                            </div>
                            <ol id="creators${data.id}" class="list-group list-group-numbered">
                            </ol>
                        </div>
                    </div>`
                    const characterList = document.getElementById(`character${s.id}`);
                    const creatorsList = document.getElementById(`creators${s.id}`);
                    data.characters.items.forEach(c => {
                        characterList.innerHTML += `<li class="list-group-item">${c.name}</li>`;
                    })
                    data.creators.items.forEach(c => {
                        creatorsList.innerHTML += `<li class="list-group-item">${c.role.toUpperCase()}: ${c.name}</li>`;
                    })
                })
            })
        })
    }
}

export default HeroView