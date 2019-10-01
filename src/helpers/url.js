import includes from 'lodash/includes';

class UrlCore {


}

class Url extends UrlCore {

    constructor(location) {
        super()
        this.location = location;
    }

    isInAnyPage(){
        return true;
    }

    getUrl() {
        return this.location;
    }

    isTheHomepage() { 
        if (this.location.pathname === '/')
            return true;

        return false;
    }

    isNotTheHomepage() {
        return !this.isTheHomepage();
    }

    exactlyMatches(value) {

        var regExp = new RegExp('^' + value + '$');

        return regExp.test(this.location.href.split('?')[0]);
    }

    doesExactlyMatch(value) { 
        return !this.exactlyMatches(value);
    }

    contains(value) {  
        
        if (includes(this.location.href,value))
            return true;

        return false;
    }

    doesNotContain(value) {
        return !this.contains(value);
    }

    endWith(value) {
        return this.location.href.endsWith(value)
    }

    doesNotEndWith(value) {
        return !this.endWith(value)
    }

    matchesThepattern() {

    }
}

export default Url;