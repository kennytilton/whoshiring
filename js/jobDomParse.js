goog.provide('Hiring.jobDomParse')

var internOK = new RegExp(/((internship|intern)(?=|s,\)))/i)
    , nointernOK = new RegExp(/((no internship|no intern)(?=|s,\)))/i)
    , visaOK = new RegExp(/((visa|visas)(?=|s,\)))/i)
    , novisaOK = new RegExp(/((no visa|no visas)(?=|s,\)))/i)
    , onsiteOK = new RegExp(/(on.?site)/i)
    , remoteOK = new RegExp(/(remote)/i)
    , noremoteOK = new RegExp(/(no remote)/i);

/*
ziprecruiter just did not use bars
victor opened with text and then did the bar headlines as two <p>s
Cloudflare 17206564 looks OK
Opencraft
Muru
Serverless
SignedBlock
SOUNDBOOKS
Strava
Curbside 17207702

 */

function jobSpec(dom) {
    let spec = {hnId: dom.id, body: []};

    if (true) { // dom.id === "17206564") { // todo SHIPCHECK
        for (let n = 0; n < dom.children.length; ++n) {
            jobSpecExtend(spec, dom.children[n], 0)
        }
    }
    return spec
}

function charCount( s, c) {
    let ct = 0;
    for (var n = 0; n < s.length; ++n) {
        if (s[n] === c)
            ++ct;
    }
    return ct
}

function jobSpecExtend(spec, dom, depth) {
    var cn = dom.className;
    var clg = console.log;

    if (cn.length === 3 && "c5a,cae,c00,c9c,cdd,c73,c88".search(cn) !== -1) {
        var rs = dom.getElementsByClassName('reply');
        Array.prototype.map.call(rs, function (e) {
            e.remove()
        });

        var child = dom.childNodes
            , inHeader = true
            , barCt = 0
            , headerHasLink = false
            , titleSeg = [];

        for (var i = 0; i < child.length; i++) {
            n = child[i]

            if (inHeader) {
                if (n.nodeType === 1 && n.nodeName === 'P') {
                    var htext = titleSeg.map( function(h) { return h.textContent} ).join(" | ")
                        , hseg = htext.split("|").map( function(s) { return s.trim()})
                        , hsmatch = function (rx) { return hseg.some( function(hs) { return hs.match(rx) !== null})};

                    inHeader = false

                    spec.onsite = hsmatch(onsiteOK);
                    spec.remote = (hsmatch(remoteOK) && !hsmatch(noremoteOK));
                    spec.visa = (hsmatch(visaOK) && !hsmatch(novisaOK));
                    spec.intern = (hsmatch(internOK) && !hsmatch(nointernOK));

                    if ( !headerHasLink && !(barCt || spec.onsite || spec.remote || spec.visa || spec.intern)) {
                        // clg("aThing Not a job. breaking ", spec.hnId, depth
                        // , titleSeg.map( function(h) { return h.textContent} ).join(" | "))
                        break
                    }
                    // if (!barCt) {
                    //     clg("DUBIOUS allowed", titleSeg.map( function(h) { return h.textContent} ).join(" | "))
                    // }
                    spec.OK = true // || spec.company.search("Privacy.com") === 0;

                    spec.body.push(n) // first <p> s.b. start of body (some jobs fail this format req)

                    // finish building spec

                    spec.company = hseg[0];
                    //clg('found job co/depth', spec.company, depth)

                    spec.titlesearch = htext;
                    spec.bodysearch = spec.body.map( function(n) { return n.textContent}).join('*4*2*');
                    spec.onsite = hsmatch(onsiteOK);
                    spec.remote = (hsmatch(remoteOK) && !hsmatch(noremoteOK));
                    spec.visa = (hsmatch(visaOK) && !hsmatch(novisaOK));
                    spec.intern = (hsmatch(internOK) && !hsmatch(nointernOK));
                } else {
                    barCt += charCount( n.textContent, "|")
                    if ( n.nodeType === 1 && n.nodeName === "A")
                        headerHasLink = true;
                    //clg("hdr node", depth, n.nodeType, n.nodeName, n.textContent)
                    titleSeg.push(n)
                }
            } else {
                spec.body.push(n)
            }
        }
    }

    if (cn !== "reply") {
        for (var n = 0; n < dom.children.length; ++n) {
            //console.log('recur', dom.className, depth);
            jobSpecExtend( spec, dom.children[n], depth + 1);
        }
    }
}
