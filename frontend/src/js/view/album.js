import AlbumController from "@/js/controller/albumController";
import navInstance from "@/js/utils/navigator";

class AlbumView {
    constructor() {
        this.albumController = new AlbumController()
    }

    render() {
        console.log('render album')
        document.getElementById('loaderContainer').classList.toggle('d-none', false)
        const albumContainer = document.getElementById('albumContainer')
        this.albumController.enterOnPage().then((json) => {
            document.getElementById('loaderContainer').classList.toggle('d-none', true)
            document.getElementById('container').classList.toggle('d-none', false)
            console.log(JSON.stringify(json))
            this.#updatePagination(json.total, json.page)
            let index = 0
            let row = document.createElement('div')
            row.className = 'row'
            json.results.forEach((h) => {
                if (index % 4 === 0 && index !== 0) {
                    albumContainer.appendChild(row)
                    row = document.createElement('div')
                    row.className = 'row'
                }
                console.log('diomaledetto')
                const imageUrl = `${h.thumbnail.path}.${h.thumbnail.extension}`;
                const cell = document.createElement('div')
                cell.className = 'col-lg-3 col-md-3 col-sm-6 col-xs-9'
                const level = h.owned ? `${h.figurineLevel}★` : ''
                cell.innerHTML = `
                        <div class="hero-card ${!h.owned ? 'disabled' : ''}">
                            <img src="${imageUrl}" alt="${h.name}" class="img-fluid">
                            <div class="hero-label overflow-auto">
                                <span>${h.name}</span>
                                <span id="level">${level}</span>
                            </div>
                        </div>
                `;
                if (h.owned)
                    cell.addEventListener('click', () => {
                        navInstance.goTo('/hero', `?id=${h.id}`)
                        console.log(`clicked ${h.id}`)
                    })
                row.appendChild(cell)
                index++
            })
            albumContainer.appendChild(row)
        }).catch((e) => console.error(e))
    }

    #createPaginationItems(totalPages, currentPage) {
        const paginationList = document.createElement('ul');
        paginationList.classList.add('pagination');

        const addPageItem = (page, isActive = false) => {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            if (isActive) {
                pageItem.classList.add('active');
            }
            pageItem.innerHTML = `<a class="page-link" href="./album?page=${page}">${page}</a>`;
            paginationList.appendChild(pageItem);
        };

        const addEllipsis = () => {
            const ellipsisItem = document.createElement('li');
            ellipsisItem.classList.add('page-item', 'disabled');
            ellipsisItem.innerHTML = `<span class="page-link">...</span>`;
            paginationList.appendChild(ellipsisItem);
        };

        // Aggiungi il pulsante "Previous"
        const prevPage = document.createElement('li');
        prevPage.classList.add('page-item');
        if (currentPage === 1) {
            prevPage.classList.add('disabled');
        }
        prevPage.innerHTML = `<a class="page-link" href="./album?page=${currentPage - 1}">Previous</a>`;
        paginationList.appendChild(prevPage);

        // Logica di visualizzazione delle pagine
        if (totalPages <= 7) {
            // Mostra tutte le pagine se il numero totale è minore o uguale a 7
            for (let i = 1; i <= totalPages; i++) {
                addPageItem(i, i === currentPage);
            }
        } else {
            // Pagina 1
            addPageItem(1, currentPage === 1);

            if (currentPage > 4) {
                addEllipsis();
            }

            let startPage = Math.max(2, currentPage - 2);
            let endPage = Math.min(totalPages - 1, currentPage + 2);

            for (let i = startPage; i <= endPage; i++) {
                addPageItem(i, i === currentPage);
            }

            if (currentPage < totalPages - 3) {
                addEllipsis();
            }

            // Ultima pagina
            addPageItem(totalPages, currentPage === totalPages);
        }

        // Aggiungi il pulsante "Next"
        const nextPage = document.createElement('li');
        nextPage.classList.add('page-item');
        if (currentPage === totalPages) {
            nextPage.classList.add('disabled');
        }
        console.log('currentPage: ', currentPage)
        const nextP = `./album?page=${++currentPage}`
        console.log(nextP)
        nextPage.innerHTML = `<a class="page-link" href="${nextP}">Next</a>`;
        paginationList.appendChild(nextPage);

        return paginationList;
    }

    #updatePagination(totalPages, currentPage) {
        const placeholder = document.getElementById('pagination-placeholder');
        placeholder.innerHTML = ''; // Pulisci il contenuto precedente

        const pagination = this.#createPaginationItems(totalPages, currentPage);

        // Aggiungi la paginazione generata al placeholder
        placeholder.appendChild(pagination);
    }
}

export default AlbumView