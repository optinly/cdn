
$ = null

document.addEventListener("DOMContentLoaded", function () {
    if (typeof jQuery == "undefined") {
        // alert("jquery undefined");

        function getScript(url, success) {
            let script = document.createElement('script');
            script.src = url;
            let head = document.getElementsByTagName('head')[0],
                done = false;
            // Attach handlers for all browsers
            script.onload = script.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    // callback function provided as param
                    success();
                    script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
                }
            };
            head.appendChild(script);
        }

        let jquery_url = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";


        getScript(jquery_url, function () {
            if (typeof jQuery == "undefined") {
                console.log("wgs unable to include jQuery");
            } else {
                jQuery.noConflict();
                initWGSTracking();
            }
        });
    } else {
        // alert('defined');
        initWGSTracking();
    }
})



class WGS {
    constructor(props) {

        this.add_to_cart_selectors = '#AddToCart, #AddToCart-product-template, #AddToCart--product-template, .AddToCartText, .add_to_cart, .add-to-cart, #add-to-cart, form[action^="/cart/add"] button[type="submit"]',

            this.initAddToCart()
    }

    initAddToCart() {
        console.log('initAddToCart',)

        $(document).on('click', this.add_to_cart_selectors , function (e) {
            e.preventDefault()
            console.log('Add' )

            $(this).submit()
        })


    }

    checkCartData() {
        console.log('checkCartData')
    }

    handleAddedToCart() {
        console.log('handleAddedToCart')
    }

    initEmailCapture() {
        console.log('initEmailCapture')

    }

    getText() {
        console.log('getText')
    }


    handleEmailBypass() {
        console.log('handleEmailBypass')
    }


    terminateAddToCart() {
        console.log('terminateAddToCart')

    }


    setCustomerEmail() {

        console.log('setCustomerEmail')
    }

}


class CustomerSession {

    constructor(props) {


    }

    identifyCustomer() {
        console.log("identifyCustomer")

    }


    createCustomerSession() {
        console.log("createCustomerSession")

    }


    updateCustomerSession() {
        console.log("updateCustomerSession")
    }

    updateCustomerSession() {
        console.log("updateCustomerSession")


    }
}



function initWGSTracking() {

    $ = jQuery
    console.log("init tarck", $)
    let wgs = new WGS({})

}
