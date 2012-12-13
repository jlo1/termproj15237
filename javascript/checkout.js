//Javascript for Checkout Page


var CheckoutPage = function(){;
    this.div = $('#checkoutPage');
    this.currentTabInd = 0;
    this.navStrArr = ["cart", "delivery", "payment", "confirm"];
    this.itemCount = 0;
    this.itemIDs = [];
    this.amount = 0;
    this.isRegistered = false;
    this.load();
}

CheckoutPage.prototype.reload = function() {
    if(window.util.hasCookies("customer")) {
        $("#cartContinueBtn").text("Checkout");
        this.isRegistered = true;
    }
    else {
        $("#cartContinueBtn").text("Register Before Checkout");
        this.isRegistered = false;
    }
    console.log("reloading checkout page. Signed In: " + this.isRegistered);

    //Reload cart and checkout info. Called if signout/signin etc.

    //TODO: reload the cart and update!!
    this.updateCart();


    //reset buttons and input values
    $('#checkoutPage .invalidNote').addClass('hidden');
    $("#confirmContinueBtn").html('Confirm');
    $(".disabled").removeClass('disabled');
    $("#checkoutPage #payment input").val("");   //clear all the filled in values
}

CheckoutPage.prototype.updateCart = function() {



    this.updateAmountInCents();
}

CheckoutPage.prototype.addItemToCart = function(itemID) {
    //add item to html of productList in cart
    
    this.itemIDs.push(itemID);
    this.itemCount += 1;
}

CheckoutPage.prototype.removeItemFromCart = function(itemID) {
    //if (itemID not found) return;
    //remove item from html of productList in cart
    
    this.itemIDs.splice(this.itemIDs.indexOf(itemID), 1);
    this.itemCount -= 1;
}

CheckoutPage.prototype.paymentComplete = function () {
    //empty cart
    //this.itemCount = 0;
    switchTab.bind(this)($("#checkoutPage .activeTab"), $("#checkoutPage #cartLink"));
    this.reload();
}

CheckoutPage.prototype.updateAmountInCents = function() {
    this.amount = 2050;
    $(".priceDollars").html(Math.floor(this.amount/100));
    $(".priceCents").html(this.amount%100);
}

CheckoutPage.prototype.load = function() {
    var thisPage = this;
    if(window.util.hasCookies("customer")) {
        $("#cartContinueBtn").text("Checkout");
        this.isRegistered = true;
    }
    else {
        $("#cartContinueBtn").text("Register Before Checkout");
        this.isRegistered = false;
    }


    $('.invalidNote').addClass('hidden');

    $("#checkoutPage .leftNav a#cartLink").on(window.util.eventstr, function(e) {
        switchTab.bind(thisPage)($("#checkoutPage .activeTab"), $(e.target));
    });
    
    $(".continueBtn").on(window.util.eventstr, function(e) {
        if($(e.target).attr('id') === "paymentContinueBtn") {

            $("#paymentContinueBtn").addClass('disabled');
            $("#paymentBackBtn").addClass('disabled');
            Stripe.createToken({
                number: $('#card-number').val(),
                cvc: $('#card-cvc').val(),
                exp_month: $('#card-expiry-month').val(),
                exp_year: $('#card-expiry-year').val()
            }, stripeResponseHandler.bind(this));

            //don't switch tab if error occurred
            return;
        }

        else if($(e.target).attr('id') === "confirmContinueBtn") {
            /*Change button to text of confirmation of payment*/
            postToChargeCard.bind(this)();
            return;
        }

        else if($(e.target).attr('id') === "cartContinueBtn") {
            //force signin before checking out
            if(this.isRegistered === false) {
                this.appDOM.signInBeforeCheckout();
                return;
            }


            if(thisPage.itemCount === 0) {
                alert("No items added to cart");
                //return;
            }
            this.updateAmountInCents.bind(this)();
            /*TODO: Check user authentication/login/register...*/
        }
        
        var nextTabName = thisPage.navStrArr[thisPage.currentTabInd + 1];
        switchTab.bind(thisPage)($("#checkoutPage .activeTab"),
                                $("#" + nextTabName + "Link"));
    }.bind(this));


    $(".goBackBtn").on(window.util.eventstr, function(e) {

        $(".disabled").removeClass('disabled');

        var prevTabName = thisPage.navStrArr[thisPage.currentTabInd - 1];
        switchTab.bind(thisPage)($("#checkoutPage .activeTab"),
                                $("#" + prevTabName + "Link"));
    });
}

function stripeResponseHandler (status, response) {
    var errorDiv = $('#payment #invalidPaymentInfo')
    if (response.error) {
        errorDiv.text(response.error.message);
        errorDiv.removeClass("hidden");    
        errorDiv.slideDown(300);
        console.log("stripeResponseHandler: response.error");
            $("#paymentContinueBtn").removeClass('disabled');
            $("#paymentBackeBtn").removeClass('disabled');
        return;
    }

    var form = $("#paymentForm");
    $("input[name='stripeToken']").remove();
    $("input[name='stripePrice']").remove();
    form.append("<input type='hidden' name='stripeToken' value='" + response.id + "'/>");
    form.append("<input type='hidden' name='stripePrice' value='" + this.amount + "'/>");
    form.append("<input type='hidden' name='stripeUser' value='TODO: checkout.js:119'/>");
    console.log("About to post token to server");

    //change tab to Confirm page
    errorDiv.addClass("hidden");
    var nextTabName = this.navStrArr[this.currentTabInd + 1];
    switchTab.bind(this)($("#checkoutPage .activeTab"),
        $("#" + nextTabName + "Link"));

}

function postToChargeCard() {
    var errorDiv = $('#payment #invalidPaymentInfo')
    //charge credit card for money
    var thisPage = this;
    var form = $("#paymentForm");
    $.post(
        form.attr('action'),
        form.serialize(),
        function (status) {
            if (status != 'ok') {
                errorDiv.text(status);
                errorDiv.slideDown(300);
                alert("Could not process payment information.")
                $("#paymentContinueBtn").removeClass('disabled');
                $("#paymentBackBtn").removeClass('disabled');
            }
            else {
                $("#confirmContinueBtn").html('Checkout Complete');
                $("#confirmContinueBtn").addClass('disabled');
                thisPage.paymentComplete();
            }
        }
    );


}