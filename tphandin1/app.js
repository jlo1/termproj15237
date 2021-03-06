/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , products = require('./routes/products')
  , http = require('https')
  , fs = require('fs')
  , path = require('path')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , Farmer = require('./models/Farmer')
  , Customer = require('./models/Customer')
  , Farm = require('./models/Farm')
  , stripe = require('stripe')("sk_test_QkRJtqt6wauRuJ1naiKqWo3s")
  , Product = require('./models/Product');
  
var app = express();

//configuring middleware
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser());
  app.use(express.session({secret: "cheecks"}));

  app.use(express.static(path.join(__dirname ,'/javascript')));
  app.use("/css", express.static(path.join(__dirname ,'/html/customer/css')));
  app.use("/img", express.static(path.join(__dirname ,'/html/customer/images')));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
});

initPassport();

app.configure('development', function(){
  app.use(express.errorHandler());
});

//routes
app.get('/', customerGet); //route to customer get?

app.get('/farmer', farmGet);
app.get('/customer', customerGet);

app.post('/loginFarm', passport.authenticate('local'), farmerLogin);
app.post('/loginCustomer', passport.authenticate('local'), customerLogin);
app.post('/signout', signOut);
app.post('/registerFarm', registerFarm);
app.post('/registerCustomer', registerCustomer);

app.all('/addFarm', addFarm);
app.all('/hasFarm', hasFarm);
app.all('/getProducts', getProducts);
app.all('/addProduct', addProduct);
app.post('/checkoutPay', checkoutPay);


/*
 * Routing handlers.
 */

function farmGet(req, res){
    console.log("farmget", req.user);
    if(req.user != undefined){
        console.log("farmer cookie: " + req.user.id);
        res.cookie("farmer", req.user.id);
    }
    else{
        console.log("farmer cookie none");
        res.cookie("farmer", "none");
    }
    res.sendfile('html/farmerpage.html');
}

function farmerLogin(req, res){
    res.status(200);
    console.log("logigng in ");
    res.cookie("farmer", req.user.id);
    Farm.findOne({farmer: req.user.id}, function(err, farm){ 
        console.log(farm);
        if(farm){
            console.log('found something');
            res.send(farm);
        }else{
            console.log('found nothing ;(');
            res.send(false);
        }
    });
}

function customerGet(req, res){
    console.log("customereget: " + req.user)
    if(req.user != undefined){
        console.log(req.user);
        res.cookie("customer", req.user.id);
    }
    else{
        console.log("undef?" +req.user);
        res.cookie("customer", "none");
    }
    res.sendfile('html/customer/index.html');
}

function customerLogin(req, res){
    res.status(200);
    res.cookie("customer", req.user.id);
    res.send(req.user);
}

function checkoutPay(req, res){
    res.status(200);
    var charge = stripe.charges.create({
        amount : 2000,
        currency : "usd",
        card : req.body.stripeToken,
        description : req.body.stripeUser
        }, function(payErr, charge) {
            if(payErr) {
                console.log("In error of checkoutPay (app.js)");
                console.log("Card Token: " + req.body.stripeToken);
                console.log("Amount: " + req.body.stripePrice);
                console.log("Description: " + req.body.stripeUser);
                var msg = charge.failure_response || "unknown";
                res.send("Error processing payment: " + msg );
            }

            else {
                console.log('Success! Fake charged a card for $$$$!');
                // save this customer to your database here!
                res.send('ok');
            }
        }
    );
}

function signOut(req, res){
    res.cookie(req.body.cookieType, "none");
    console.log("signing out " + req.body.cookieType);
    req.logout();
    res.end();
}

function registerFarm(req, res){
    var username = req.body.username;

    Farmer.findOne({username: username}, function(err, existingUser){
        if(err){
            return res.send({ 'err' : err});
        }
        if(existingUser){
            res.send('user exists');
        }

        var user = new Farmer({username : req.body.username});
        user.password = req.body.password;
        user.save();
    });
}

function registerCustomer(req, res){
    var username = req.body.username;

    Customer.findOne({username: username}, function(err, existingUser){
        if(err){
            return res.send({ 'err' : err});
        }
        if(existingUser){
            res.send('user exists');
        }
        else{
            var user = new Customer({username : req.body.username});
            user.password = req.body.password;
            user.save();
            res.cookie('customer', user.id);
            res.end();
        }
    });
}

function hasFarm(req, res){
    Farmer.findById(req.user.id, function(err, farmer){
        res.status(200);
        var hasfarm = farmer.farm != undefined;
        console.log("farmer.farm: ", farmer.farm);
        console.log("hasfarm: ", hasfarm);
        res.send(hasfarm);
    });
}

function addProduct(req, res){
    var p = new Product();
    p.name = req.body.name;
    p.category = req.body.category;
    p.description = req.body.description;
    p.price = req.body.price;
    Farmer.findById(req.user.id, function(err, farmer){
        p.farm = farmer.farm;
        p.save();
        res.status(200);
        console.log("product added");
        res.end();
    });
}

function getProducts(request, response){
    var term = request.body.term;
    console.log("term: " + term);
    Product.find({name: term}, function(err, nameResults){
        console.log(nameResults);
        Product.find({$where:"this.category.indexOf(term)!==-1"}, function(err, catResults){
            console.log(catResults);
            Farm.find({name : term}, function(err, farm){
                console.log(farm);
                var farmResults;
                farm.forEach(function(value){
                   farmResults = farmResults.concat(value.products); 
                });
                console.log("found farmname");
                Farm.find({city : term}, function(err, city){
                    console.log(city);
                    var cityResults;
                    city.forEach(function(value){
                       cityResults = cityResults.concat(value.products); 
                    });
                    console.log("found city");
                  Farm.find({state : term}, function(err, state){
                    console.log(state);
                    var stateResults;
                    state.forEach(function(value){
                       stateResults = stateResults.concat(value.products); 
                    });
                    console.log("found state");
                       var results = nameResults.concat(catResults).concat(farmResults).concat(cityResults).concat(stateResults);
                       response.send(results);
                       console.log(results);
                    });
                });
            });
        });
       response.status(200); 
       response.send(nameResults);
       console.log(nameResults);
    });
}

function addFarm(req, res){
    console.log("in add farm");
    console.log(req.user);
    Farmer.findById(req.user.id, function(err, farmer){
        if(farmer){
            if(farmer.farm){
                console.log("farmer already has a farm!");
                res.status(401);
                res.end();
            }
            console.log(req.body);
            var newFarm = new Farm();
            newFarm.name =  req.body.name;
            newFarm.city = req.body.city;
            newFarm.state = req.body.state;
            newFarm.certifications = req.body.cert;
            newFarm.farmer = farmer.id;
            newFarm.save();
            farmer.farm = newFarm.id;
            farmer.save();
            res.status(200);
            res.end();
        }else{
            res.status(401);
            res.end();

        }
    });
    /*                          //delete this on jessica's only
    newFarm.name = request.body.name; 
    newFarm.category = request.body.category; 
    newFarm.rating = parseInt(request.body.rating);
    console.log(newFarm);
    newFarm.save(function errF(err){if(err) console.log(err);});
    */
}

/*
 * Initialize passport settings for our authentication policy
 */
function initPassport(){
    passport.use(new LocalStrategy( {passReqToCallback: true}, 
                    function(req, username, password, done){
                        console.log(req.body);
                        console.log("logging username: " + username+" password: "+password);
                        console.log("req.body.type="+req.body.type);
                        if(req.body.type === "farmer"){
                            Farmer.findOne({username: username}, function(err, user){
                                if(err){return done(err);}
                                if(!user){
                                    console.log("fail 1\n");
                                    return done(null, false);
                                }
                                if(!user.validPassword(password)){
                                console.log("fail 2\n");
                                    return done(null, false);
                                }
                                console.log("successed\n");
                                return done(null, user);
                            });
                        }else{
                            Customer.findOne({username: username}, function(err, user){
                                if(err){return done(err);}
                                if(!user){
                                    return done(null, false);
                                }
                                if(!user.validPassword(password)){
                                    return done(null, false);
                                }
                                return done(null, user);
                            });
                        }
                    })
                );

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done){
        console.log("deserializing\n");
        Customer.findById(id, function(err, user){
            if(!user){
                Farmer.findById(id, function(err2, user2){
                    done(err2, user2);
                });
            }
            else
                done(err, user);
        });
    });
}


var options = {
  key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
    };

http.createServer(options, app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



