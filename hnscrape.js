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
var fs = require('fs');

/*
The Phantom script can maintain an HTML file for load into an iframe.
The iframe can have a JSON string for the app to parse.
Changed p=n's can be reprocessed

OK, the bash script runs on my mac so it is not pounding anything.

The script grabs monthlies until the last two are no diff, then it tosses the last and writes
an HTML file with name and timestamp as JSON in a text field or sth.

A refresh button in the app reloads the info html into an iframe.

On initial load, the app loads each file for the current month into its own iframe.

Each iframe keeps its own list of jobs.

The app sees which month is selected and appends the jobs from the iframes.

The refresh button relads the iframe with the info, which telsl it which month-sub iframe
to reload, which jobs to recompute.

 */



var clg = console.log;
var page;

function handle_page(pgn, seen){
    var page = webpage.create();
    var url = 'https://news.ycombinator.com/item?id='+system.args[1]+'&p='+pgn;
    var objPop = function (obj) { return Object.keys(obj).length};
    var objMerge = function (obj, src) {
        Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
        return obj;
    }

    page.onConsoleMessage = function (msg) { console.log(msg); };
    page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36';

    console.log('url=', url, 'seen', objPop( seen));

    page.open( url, function( status){
        console.log('status '+ status);
        if ( status === "fail")
        {
            phantom.exit();
            return {};
        }

        page.injectJs('js/jobDomParse.js');
        //console.log('injected');

        var seen2 = page.evaluate( function( pgno, seen) {
            //console.log('eval cb entry');
            var hnBody = document.getElementsByTagName('body')[0];
            //console.log('eval body?', hnBody);
            var listing = Array.prototype.slice.call(hnBody.querySelectorAll('.athing'));
            console.log('athings found', pgno, listing.length);
            for ( jn = 0; // jn < 10 &&
                    jn < listing.length; ++jn) {
                var j = listing[jn];
                var s = {hnId: j.id};
                if (seen[j.id]) {
                    console.log('skipping already seen!!!!', j.id, 'onpg', seen[j.id])
                } else {
                    jobSpecExtend( s, j, 0);

                    if ( s.OK) {
                        // console.log('good job', j.id, s.hnId, s.company)
                        seen[s.hnId] = pgno;
                        //console.log( 'new spec!!!', JSON.stringify(s));
                    }
                }
            }
            console.log('reeturning seen', Object.keys(seen).length);
            return seen;
        }, pgn, seen);


        console.log('driver sees seen/seen2', objPop(seen), objPop(seen2));


        if ( pgn < 2 || objPop(seen2) > objPop(seen)) {
            console.log('get more', objPop(seen), objPop(seen2));
            setTimeout( (function () { next_page(pgn+1, objMerge( seen, seen2)) }) ,200);
        } else {
            console.log('exitting', pgn, objPop(seen2));
            var path = 'files/' + system.args[1] + '.json';
            console.log( 'seen2-0',  path);
            fs.write(path, "", 'w');
            console.log('s2keys', Object.keys(seen2).length);
            for (id in seen2) {
                //console.log('id2', id);
                fs.write( path, JSON.stringify( seen2[id]), 'a');
                fs.write( path, '\n', 'a');
            }

            console.log('fini');

            phantom.exit();
        }
    });
    // NOT HERE page.close();
}

function next_page(pgn, seen){
    if ( pgn > 20){
        console.log('stopping before page', pgn, 'seen', Object.keys( seen).length);
        phantom.exit(0);
    } else {
        console.log('npg> handling page', pgn , Object.keys( seen).length);
        handle_page(pgn, seen);
    }
}

next_page(0, {});
