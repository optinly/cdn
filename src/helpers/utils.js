import reduce from 'lodash/reduce';
import _get from 'lodash/get';
import includes from 'lodash/includes';
import Cookies from 'js-cookie';
import UUID from 'uuid';

const options = {
    prefix: 'cr-'
}

module.exports = {

    setCookie(name, value, time) {
        Cookies.set(options.prefix + name, value, { expires: time, path: '' })
    },

    getCookie(name) {
        return Cookies.get(options.prefix + name);
    },

    getAllCookies() {
        return Cookies.get();
    },

    eraseCookie(name) {
        Cookies.remove(name);
    },

    getLoadedCampaign(id) {
        return this.getCookie(id)
    },

    getLoadedCampaigns() {

        let campaigns = this.getAllCookies();

        let loadedCampagin = reduce(campaigns, (result, value, key) => {

            if (includes(key,options.prefix) === true && value === "true")
                result.push(key.replace('cr-', ''));

            return result;
        }, []);

        return loadedCampagin;
    },

    setLoadedCampaign(id, time) {

        this.setCookie(id, true, time);
    },

    eraseLoadedCampaign() {
        this.eraseCookie(this.loadedCampagin);
    },

    uuid(){ 

        let local_uid;

        if(!_get(window,'uberpopups.email')){
            
            let uuid = UUID();
            
            if(!localStorage.getItem('cruuid'))
                 localStorage.setItem('cruuid', uuid);
            
            return { uid: uuid, email:'', lstatus: false }
        }else{
            
            local_uid = localStorage.getItem('cruuid');

            if(local_uid)
                return { uid: '', email: window.uberpopups.email, mapid: localStorage.cruuid, lstatus: true }

            return { uid: '',email: window.uberpopups.email, lstatus: true}
        } 
    }
}