system = require('system');

var page = require('webpage').create();
page.open('https://news.ycombinator.com/item?id='+system.args[1], function(status) {
    console.log("Status: " + status);
    if(status === "success") {
        console.log('baby steps')
        // console.log('body', page.contentDocument.getElementsByTagName('body')[0])
    }
    phantom.exit();
});

/*
page.open(`https://news.ycombinator.com/item?id=${system.args[1]}`, function(status) {


function jobsCollect(md) {
    if (md.dom.contentDocument) { // FF
        hnBody = md.dom.contentDocument.getElementsByTagName('body')[0];
        let chunkSize = PARSE_CHUNK_SIZE
            , listing = Array.prototype.slice.call(hnBody.querySelectorAll('.athing'))
            , tempJobs = []
            , progressBar = md.fmUp("progress");

        ast(progressBar);
        progressBar.hidden = false

        if (listing.length > 0) {
            progressBar.max = Math.floor( listing.length / PARSE_CHUNK_SIZE)+""
            parseListings( listing, tempJobs, PARSE_CHUNK_SIZE, progressBar)
        }
    }
}
 */