//Javascript for Products Page

var ProductsPage = function(){
    this.div = $('#productsPage');
    this.load();
    this.sortFilter = "recommended";
}

ProductsPage.prototype.load = function() {
    var btnSearchObj = $(document.getElementById("btnRight"));
    btnSearchObj.on(window.util.eventstr, search);
    $("#searchterm").keyup(function(e) {
        if (e.which === 13) {
            search(e);
        }
    });
    
    $(".sortOption").on(window.util.eventstr, function(e) {
        $(".sortOption.selected").removeClass("selected");
        $(e.target).closest(".sortOption").addClass("selected");
        $(e.target).closest(".sortOption").children("input:radio[name=sort]").attr('checked', true);
    });
    
    var btnLeftObj = $(document.getElementById("btnLeft"));
    btnLeftObj.on(window.util.eventstr, function() {
    
        var filterContObj = $("#filterContent");
        var productContObj = $("#productContent");
        //If on results page, Go to filter page
        if(productContObj.css('display') === 'block') {            
            filterContObj.css('display', 'block');
            productContObj.css('display', 'none');
            btnLeftObj.html('Back');
            document.getElementById("btnRight").innerHTML = "Apply";
        }
        //If on filter page, Go back to results page, no effect
        else if(filterContObj.css('display') === 'block') { 
            productContObj.css('display', 'block');           
            filterContObj.css('display', 'none');
            btnLeftObj.html('Filter');
            document.getElementById("btnRight").innerHTML = "Search";
            
            //TODO: restore filter page to last saved selections
        }
    
    });
    
    /* .itemBlock.itemDetails on 'click':
     * Go to productpage
     * .itemBlock.rating on 'click':
     * Go to productpage#reviews
     */
}

function search(e){
    var term = $("#searchterm").val();
    $.ajax({
        url: '/getProducts',
        data: {term: term},
        type: 'POST',
        success: gotProducts
    });
}

function gotProducts(data){
    if(data.nameResults.length === 0){
        console.log("empty");
    }
    var container, itemBlock, itemImg, itemDetails, h1, p, farmDist, rating, itemAmount, input, select, options, j;
    
    console.log(data);
    for(var i = 0; i < data.nameResults.length; i++){
        container = $("#productContent");
        itemBlock = $(document.createElement("div")).addClass("itemBlock");
        itemImg = $(document.createElement("img")).addClass("itemImg");
        itemDetails = $(document.createElement("div")).addClass("itemDetails");
        h1 = $(document.createElement("h1"));
        p = $(document.createElement("p")).html(data.farmData[i].name);
        farmDist = $(document.createElement("span"));
        rating = $(document.createElement("div")).addClass("rating");
        itemAmount = $(document.createElement("div")).addClass("itemAmount");
        input = $(document.createElement("input")).attr("type", "number").attr("value", "0").attr("min", "0").addClass("amountNumber"); 
        select = $(document.createElement("select")).addClass("amountUnit");
        options = [];
        for(var j = 0; j < 6; j++){
            options[j] = $(document.createElement("option")).attr("value", "val"+j);
            select.append(options[j]);
        }
        p.append(farmDist);
        h1.html(data.nameResults[i].name);
        itemDetails.append(h1).append(p);
        itemAmount.append(input).append(select);
        itemBlock.append(itemImg).append(itemDetails).append(rating).append(itemAmount);
        container.append(itemBlock);
    }
}









