// goog.require('Matrix.Cells')
// goog.require('Matrix.Model')
// goog.require('Matrix.mxWeb')
// goog.require('Hiring.usernote')
// goog.provide('Hiring.jobDomParse')

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
            , titleSeg = [];

        if (child[0].nodeType === 3
            // && child[0].textContent.search("Instructure") !== -1
            && child[0].textContent.split("|").length > 1) {

            spec.body = []

            for (var i = 0; i < child.length; i++) {
                n = child[i]

                if (inHeader) {
                    if (n.nodeType === 1 && n.nodeName === 'P') {
                        inHeader = false
                        spec.body.push("<p>" + n.innerHTML + "</p>")
                    } else {
                        titleSeg.push(n)
                    }
                } else {
                    if (n.nodeType === 1) {
                        spec.body.push("<p>" + n.innerHTML + "</p>");
                    } else if (n.nodeType === 3) {
                        spec.body.push("<p>" + n.textContent + "</p>");
                    } else {
                        clg('lodernodetype bad ', n.nodeType);
                        spec.body.push("")
                    }
                }
            }

            var htext = titleSeg.map( function(h) { return h.textContent} ).join(" | ")
                , hseg = htext.split("|").map( function(s) { return s.trim()})

            var internOK = new RegExp(/((internship|intern)(?=|s,\)))/i)
                , nointernOK = new RegExp(/((no internship|no intern)(?=|s,\)))/i)
                , visaOK = new RegExp(/((visa|visas)(?=|s,\)))/i)
                , novisaOK = new RegExp(/((no visa|no visas)(?=|s,\)))/i)
                , onsiteOK = new RegExp(/(on.?site)/i)
                , remoteOK = new RegExp(/(remote)/i)
                , noremoteOK = new RegExp(/(no remote)/i)
                , hsmatch = function (rx) { return hseg.some( function(hs) { return hs.match(rx) !== null})};

            spec.company = hseg[0];
            console.log('job ok!!!!', spec.company)
            spec.OK = true // || spec.company.search("Privacy.com") === 0;

            spec.titlesearch = htext;
            spec.bodysearch = spec.body.map( function(n) { return n.textContent}).join('<**>');
            spec.onsite = hsmatch(onsiteOK);
            spec.remote = (hsmatch(remoteOK) && !hsmatch(noremoteOK));
            spec.visa = (hsmatch(visaOK) && !hsmatch(novisaOK));
            spec.intern = (hsmatch(internOK) && !hsmatch(novisaOK));
        }
    }
    if (cn !== "reply") {
        for (var n = 0; n < dom.children.length; ++n) {
            //console.log('recur', dom.className, depth);
            jobSpecExtend( spec, dom.children[n], depth + 1);
        }
    }
}

// function jobExtend(j, dom, depth) {
//     var cn = dom.className;
//     //clg('jext', depth, cn);
//
//     if (cn.length === 3 && "c5a,cae,c00,c9c,cdd,c73,c88".search(cn) !== -1) {
//         var rs = dom.getElementsByClassName('reply');
//         Array.prototype.map.call(rs, function (e) {
//             e.remove()
//         });
//
//         let child = dom.childNodes
//             , inHeader = true;
//
//         if (child[0].nodeType === 3
//             // && child[0].textContent.search("Instructure") !== -1
//             && child[0].textContent.split("|").length > 1) {
//
//             j.title = []
//             j.body = []
//
//             for (let i = 0; i < child.length; i++) {
//                 n = child[i]
//
//                 if (inHeader) {
//                     if (n.nodeType === 1 && n.nodeName === 'P') {
//                         inHeader = false
//                         j.body.push(n)
//                     } else {
//                         j.title.push(n)
//                     }
//                 } else {
//                     j.body.push(n)
//                 }
//             }
//
//
//             let htext = j.title.map( function(h) { return h.textContent}).join(" | ")
//                 , hseg = htext.split("|").map( function(s) { return s.trim()})
//
//             let internOK = new RegExp(/((internship|intern)(?=|s,\)))/, 'i')
//                 , nointernOK = new RegExp(/((no internship|no intern)(?=|s,\)))/, 'i')
//                 , visaOK = new RegExp(/((visa|visas)(?=|s,\)))/, 'i')
//                 , novisaOK = new RegExp(/((no visa|no visas)(?=|s,\)))/, 'i')
//                 , onsiteOK = new RegExp(/(on.?site)/, 'i')
//                 , remoteOK = new RegExp(/(remote)/, 'i')
//                 , noremoteOK = new RegExp(/(no remote)/, 'i')
//                 , hsmatch = function (rx) {
//                 return hseg.some( function(hs) { return hs.match(rx) !== null})
//             };
//
//             j.company = hseg[0]
//             j.OK = true // || j.company.search("Privacy.com") === 0;
//
//             j.titlesearch = htext
//             j.bodysearch = j.body.map( function(n) { return n.textContent}).join('<**>')
//             j.onsite = hsmatch(onsiteOK)
//             j.remote = (hsmatch(remoteOK) && !hsmatch(noremoteOK))
//             j.visa = (hsmatch(visaOK) && !hsmatch(novisaOK))
//             j.intern = (hsmatch(internOK) && !hsmatch(novisaOK))
//         }
//     }
//     if (cn !== "reply") {
//         //clg('recur', depth, dom.className)
//         for (let n = 0; n < dom.children.length; ++n) {
//             jobExtend(j, dom.children[n], depth + 1);
//         }
//     }
// }