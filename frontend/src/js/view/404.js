class NotFoundView {
    constructor() {
    }

    render() {
        console.log('render 404 not found')
        document.getElementById('navBar').classList.toggle('d-none', true)
    }
}

export default NotFoundView