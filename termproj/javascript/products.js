//Javascript for Products Page

var ProductsPage = function(){
    this.div = $('#productsPage');
    this.load();
    this.sortFilter = "recommended";
}

ProductsPage.prototype.load = function() {
    var btnSearchObj = $(document.getElementById("btnRight"));
    btnSearchObj.on(window.util.eventstr, function() {
        //Show results of search
        
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