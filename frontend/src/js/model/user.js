class User {
    constructor(name, surname, email, pwd, isHero, favouriteHero) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.pwd = pwd;
        this.isHero = isHero;
        this.favouriteHero = favouriteHero;
    }

    isValidUser() {
        return this.name && this.surname && this.email && this.pwd && this.favouriteHero;
    }
}

export {User};