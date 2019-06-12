const fs = require('fs')
const cheerio = require('cheerio');

//update the path if you want to test with another file
const path = './test.html'

try {
	if (fs.existsSync(path)){
		fs.readFile(path, 'utf8', function(err, contents) {
			if (!err){
				//Clean the doc of all \"
                var proper = contents.replace(/\\"/g,'');
                proper = proper.replace(/\\r\\n/g,'');
                
                //instanciate the file in cheerio to get data
                const $ = cheerio.load(proper);
                
                //Get data
                var code = $('span','.pnr-ref').last().text().trim();
                var name = $('span','.pnr-name').first().text().trim();
                var price = $('.very-important').first().text().trim();
                price =price.substring(0, price.length-2);
                var prices = {};
                var value ="value" ;
                prices[value]=[];
                $('[width=85]').each(function (index,v){
                    if ($(this).text().includes("€")){
                        var val = $(this).text().trim();
                        val = val.substring(0,val.length-2);
                        prices[value].push(val);
                    }
                })
                var amount = $('.amount').text().trim();
                amount = amount.substring(0, amount.length-2);
                prices[value].push(amount);
                var roundTrips=[];

                var allTrain = [];
                var tabDate = [];
                var tabType = [];
                $('.product-travel-date').each(function(index,v){
                    tabDate.push($(this).text().trim());
                });
                $('.product-details').each(function(index,v){
                    tabType.push($('.travel-way',this).text().trim());
                    var departureTime=$('.origin-destination-hour',this).text().trim();
                    var departureStation=$('.origin-destination-station',this).text().trim();
                    var type=$('.segment',this).first().text().trim();
                    var number=$('.segment',this).text().trim();
                    number = number.substring(3).trim();
                    var arrivalTime=$('.origin-destination-border',this).first().text().trim();
                    var arrivalStation=$('.origin-destination-hour',this).last().text().trim();
                    var train = {
                        departureTime,
                        departureStation,
                        arrivalTime,
                        arrivalStation,
                        type,
                        number
                    }
                    allTrain.push(train);
                    
                });

                allTrain.forEach(function(element,index) {
                    var roundTrip = {
                        "type" : tabType[index],
                        "date" : tabDate[index],
                        "trains" : element,
                    }
                    roundTrips.push(roundTrip);
                  });

                var result = {};
                var trips = "trips";
                var custom = "custom";
                result[trips]=[];
                result[custom]={};
                

                 var firstTrip = {
                    code,
                    name,
                    "details":{
                        price,
                        roundTrips,
                    }
                }
                var firstCustom = {
                    prices,
                }

                result[trips].push(firstTrip);
                result[custom]=firstCustom;

                var json = {
                    "status": "ok",
                    result,
                }
				
                //Create file
                console.log(JSON.stringify(json));
				fs.writeFile('return.json', JSON.stringify(json).replace(/\\"/g,''), function (err) {
					if (err) throw err;
					console.log('File is created successfully.');
				});  
			}
		});
	}
}
catch (err){
	console.error(err)
}