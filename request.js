const Config = require("./config.js");
const cheerio = require("cheerio");
var request = require("request");
var NCMB = require("ncmb");
var ncmb = new NCMB(Config.applicationKey, Config.clientKey);
var News = ncmb.DataStore("news");

var options = {
    url: Config.news_url,
    method: "GET",
};
var results = [];

var saveData = function(data, handler) {
    var news = new News();
        news.set("title", data.title)
        .set("href", data.url)
        .set("src", data.imgUrl)
        .save()
        .then(function(news){
            handler(true);
        })
        .catch(function(error){
            handler(false);
        });

};

var getDataFromTitle = function(obj, handler) {
    News.equalTo("title", obj.title)
    .fetchAll()
    .then(function(res){
        if(res.length == 0) {
            handler(obj, true);
        }
    })
    .catch(function(error){
        handler(obj, false);
    });
};

request(options, function (error, response, body) {
    const $ = cheerio.load(body)  
    $(".newsFeed_list").find(".newsFeed_item").each(function(i,val){
        var href = $(val).find(".newsFeed_item_link").attr("href");
        if(href == undefined) {
            return
        }
        var title = $(val).find(".newsFeed_item_link").find(".newsFeed_item_title").text();
        var imgSrc = $(val).find(".newsFeed_item_link").find("img").attr("src");
        results.push({
            "title": title,
            "url": href,
            "imgUrl": imgSrc,
        });
    });
    for(var i=0;i<results.length;i++) {
        var obj = results[i];
        getDataFromTitle(obj, function(obj, isSuccess) {
            if(isSuccess) {
                saveData(obj, function(isSuccess) {
                    if(isSuccess) {
                    }
                });
            }
        });
    }
});
