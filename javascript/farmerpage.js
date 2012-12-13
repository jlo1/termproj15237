window.onload = function(){
   if(hasSessionCookie()) console.log("have cookies");
   var button = $("#submit_login"); 
   button.on('click', logIn);
   var reg = $("#submit_register")
   reg.on('click', register);
   var ap = $("#addprice"); ap.on('click', addprice);
   var submit = $("#submitbutton");
   submit.on('click', submitProducts);
   var farm = $("#addfarmbutton");
   farm.on('click', addFarm);
   var signoutbutton = $("#signout");
   signoutbutton.on("click", signOut);
   
   if(!hasSessionCookie()){
        document.getElementById('addproductpage').style.display = 'none';
        document.getElementById('addfarmpage').style.display = 'none';
        document.getElementById('signout').style.display = 'none';
   }else{
        document.getElementById('loginpage').style.display = 'none';
        document.getElementById('signout').style.display = 'block';
        $.ajax({
            url: '/hasFarm',
            type: 'POST',
            success: function(hasFarm){
                console.log("hasfarm?: ", hasFarm);
                if(hasFarm){
                    document.getElementById('addfarmpage').style.display = 'none';
                    document.getElementById('addproductpage').style.display = 'block';
                }else{
                    console.log("false");
                    document.getElementById('addfarmpage').style.display = 'block';
                    document.getElementById('addproductpage').style.display = 'none';
                }
            }
        });
        //TODO: fix this bug
   }
    
    
}
var register = function(){
    var username = $("#username_register").val();
    var password = $("#password_register").val();
    var check = $("#password_check").val();
    if(check != password){
        $("#nomatch").html("your passwords did not match!").css("color", "red");
        return;
    }
    $.ajax({
        url: "/registerFarm",
        type: "POST",
        data: {username: username, password: password, type : "farmer"},
        success: successRegister,
        error: errorRegister
    });
}
var logIn = function(){
    var username = $("#username").val();
    var password = $("#password").val();
    $.ajax({
        url: "/loginFarm",
        type: "POST",
        data: {username: username, password:password, type:"farmer"},
        success: successLogIn,
        error: errorLogIn
    });
    
}
function successRegister(){
    document.getElementById('addfarmpage').style.display = 'block';
    document.getElementById('addproductpage').style.display = 'none';
    document.getElementById('loginpage').style.display = 'none';
    document.getElementById('signout').style.display = 'block';
}
function successAddFarm(){
    document.getElementById('addfarmpage').style.display = 'none';
    document.getElementById('addproductpage').style.display = 'block';
    document.getElementById('loginpage').style.display = 'none';
    document.getElementById('signout').style.display = 'block';
}
function errorRegister(err){
    document.write("err: " + err);
}
function successLogIn(data){
    if(!hasSessionCookie()) return errorLogIn();
    if(data){
        document.getElementById('addproductpage').style.display = 'block';
        document.getElementById('addfarmpage').style.display = 'none';
        $("#addpproductpage").children("h1").html("Add Product to "+data.name);
    }else{
        document.getElementById('addproductpage').style.display = 'none';
        document.getElementById('addfarmpage').style.display = 'block';
    }
    document.getElementById('loginpage').style.display = 'none';
    document.getElementById('signout').style.display = 'block';
}

function errorLogIn(){
    $("#incorrect").html("incorrect login!").css("color", "red");
}
function addFarm(){
    var name = $("#farm_name").val();
    var city = $("#city").val();
    var state = $("#state").val();
    var cert = $("#cert").val().split(" ");

    $.ajax({
        url: '/addFarm',
        type: 'POST',
        data: {name: name, city: city, state:state, cert:cert},
        success: successAddFarm
    });
}

function addprice(){
    var num = $("#pricesdiv").children("div").length;
    var lastDiv = $("#d"+num);
    var lastPrice = parseFloat(lastDiv.children("#p"+num).val());
    if(isNaN(lastPrice)){
        $("#v"+num).html("enter a valid price!").css("color", "red");
        return;
    }
    else{
        lastPrice = Math.round(lastPrice*100)/100;
        console.log(lastPrice);
        $("#p"+num).val(""+lastPrice);
        $("#v"+num).html(""); 
    }
    num++;
    var nextDiv = $(document.createElement("div")).attr("id", "d"+num);
    var lp = $(document.createElement("label")).attr("for", "p"+num).html("Price:  ");
    var ip = $(document.createElement("input")).attr("type", "text").attr("name", "p"+num).attr("id", "p"+num);
    var lu = $(document.createElement("label")).attr("for", "u"+num).html("Unit:  ");
    var iu = $(document.createElement("input")).attr("type", "text").attr("name", "u"+num).attr("id", "u"+num);
    var v = $(document.createElement("div")).attr("id", "v"+num);
    nextDiv.append(lp).append(ip).append(lu).append(iu).append(v);
    $("#pricesdiv").append(nextDiv);
}

function submitProducts(){
    console.log("submit products");
    var num = $("#pricesdiv").children("div").length;
    var lastDiv = $("#d"+num);
    var lastPrice = parseFloat(lastDiv.children("#p"+num).val());
    if(isNaN(lastPrice)){
        $("#v"+num).html("enter a valid price!").css("color", "red");
        return;
    }
    else{
        lastPrice = Math.round(lastPrice*100)/100;
        console.log(lastPrice);
        $("#p"+num).val(""+lastPrice);
        $("#v"+num).html(""); 
    }
    var name = $("#name").val();
    var category = $("#category").val().split(" ");
    var description = $("#description").val();
    var pricelist = {units: [], costs: []};
    for(var i = 0; i < $("#pricesdiv").children("div").length; i++){
        var p = Number($("#p"+(i+1)).val());
        var u = $("#u"+(i+1)).val();
        pricelist.units.push(u);
        pricelist.costs.push(p);
    }

    console.log(pricelist);
    $.ajax({
        url: '/addProduct',
        type: 'POST',
        data: {name: name, category:category, description: description, price:pricelist},
        success: function(){console.log("success");},
        error: function(){console.log("not logged in");}
    });
    
}

function signOut(){
    $.ajax({
        url: '/signout',
        type: 'POST',
        data: {cookieType: 'farmer'},
        success: function(){
            document.getElementById('addproductpage').style.display = 'none';
            document.getElementById('addfarmpage').style.display = 'none';
            document.getElementById('loginpage').style.display = 'block';
            document.getElementById('signout').style.display = 'none';
        }
    });
}

function hasSessionCookie(){
    console.log("checking session cookie\n");
    var cookieArray = document.cookie.split(';');
    var cookies = {};
    for (var i = 0; i < cookieArray.length; i++){
        var parts = cookieArray[i].split('=');
        var key = parts[0].trim();
        var value = parts[1];
        cookies[key] = value;
    }
    //user will be an id if they're logged in
    console.log(cookies['farmer']);
    return cookies['farmer'] !== 'none';
}
