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
tst = {};

tst[1]="one";
tst[2]="two";
tst[3]="";
tst["4"] = 4;
tst[4]=44;

console.log('tst ', JSON.stringify(tst));
console.log('tst2', tst[2], tst[4], tst["4"]);

tst2 = JSON.parse( JSON.stringify(tst))
console.log('tst2-2', tst2[2]);
console.log('keys', Object.keys(tst2));
console.log('unfrined?', tst2[222]===undefined)
phantom.exit(0);

*/

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

var clg = console.log;
var page;

function handle_page(pgn, seen){
    var page = webpage.create();
    var url = 'https://news.ycombinator.com/item?id='+system.args[1]+'&p='+pgn;
    console.log('url=', url, 'seen', Object.keys(seen).length);
    page.onConsoleMessage = function (msg) { console.log(msg); };
    page.open( url, function( status){
        console.log('status '+ status+','+pgn);
        // var title = page.evaluate(function(s){
        //     return document.querySelector(s).innerText;
        // }, 'title');
        // console.log('title = '+title);

        page.injectJs('js/jobDomParse.js');
        console.log('injected');

        var seen2 = page.evaluate( function( pgno, seen) {

            //console.log('eval start', pgno, seen);
            console.log('eval start2', pgno, 'seenkeys', Object.keys(seen).length);

            // if (!page.injectJs('hnscrapejob.js')) {
            //     console.log('scrapejob not loaded');
            //     phantom.exit(17);
            // }
            var hnBody = document.getElementsByTagName('body')[0];
            var listing = Array.prototype.slice.call(hnBody.querySelectorAll('.athing'));
            console.log('athings found', pgno, listing.length);
            for ( jn = 0; jn < 3 && jn < listing.length; ++jn) {
                var j = listing[jn];
                var s = {hnId: j.id};
                if (seen[j.id]) {
                    console.log('skipping already seen!!!!', j.id, 'onpg', seen[j.id])
                } else {
                    jobSpecExtend( s, j, 0);
                    if ( s.OK) {
                        console.log('good job', j.id)
                        seen[j.id] = pgno;
                        console.log( 'new spec!!!', JSON.stringify(s));
                    }
                }
            }
            console.log('reeturning seen', Object.keys(seen).length);
            return seen;
        }, pgn, seen)

        console.log('driver sees ', Object.keys(seen2).length);

        page.close();
        if (pgn < 3)
        setTimeout( (function () { next_page(pgn+1, seen2) }) ,500);
    });
}

function next_page(pgn, seen){
    if ( pgn > 2){
        console.log('stopping before page', pgn)
        phantom.exit(0);
    } else {
        console.log('next page seen', pgn, Object.keys(seen).length);
        handle_page(pgn, seen);
    }
}
next_page(1, {});
