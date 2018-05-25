console.log('wtf');

phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
        });
    }
    console.log(msgStack.join('\n'));
    phantom.exit(1);
};

system = require('system');
webpage = require('webpage');

/*
var page = webpage.create();
page.onConsoleMessage = function (msg) { console.log(msg); };

page.open('https://news.ycombinator.com/item?id='+system.args[1]+'&p=1', function(status) {
// page.open('http://m.bing.com', function(status) {

    var title = page.evaluate(function(s) {
        return document.querySelector(s).innerText;
    }, 'title');

    console.log(title);
    phantom.exit();

});
*/

var page;

function handle_page(pgn){
    var page = webpage.create();
    var url = 'https://news.ycombinator.com/item?id='+system.args[1]+'&p='+pgn;
    console.log('url='+url);
    page.onConsoleMessage = function (msg) { console.log(msg); };
    page.open( url, function( status){
        console.log('status '+ status+','+pgn);
        // var title = page.evaluate(function(s){
        //     return document.querySelector(s).innerText;
        // }, 'title');
        // console.log('title = '+title);

        page.injectJs('hnscrapejob.js');
        console.log('injected');

        var rpg = page.evaluate( function( pgno) {

            console.log('eval start', pgno);

            // if (!page.injectJs('hnscrapejob.js')) {
            //     console.log('scrapejob not loaded');
            //     phantom.exit(17);
            // }
            var hnBody = document.getElementsByTagName('body')[0];
            var listing = Array.prototype.slice.call(hnBody.querySelectorAll('.athing'));
            //console.log('eval end', pgno, listing.length);
            for ( jn = 0; jn < 3 && jn < listing.length; ++jn) {
                var j = listing[jn];
                var s = {hnId: j.id};
                jobExtend( s, j, 0);
                console.log( JSON.stringify(s));
            }
            return listing.length;
        }, pgn)

        console.log('driver sees '+rpg);

        page.close();
        setTimeout( (function () { next_page(pgn+1) }) ,500);
    });
}

function next_page(pgn){
    if ( pgn > 1){phantom.exit(0);}
    handle_page(pgn);
}
next_page(1);
