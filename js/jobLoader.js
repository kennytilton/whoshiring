goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.usernote')
goog.provide('Hiring.jobLoader')

// --- loading job data -----------------------------------------

function jobListingLoader() {
    return div(
        iframe({
            sandbox: ""
            , src: cF( c=> {
                let searchMo = c.md.fmUp("searchMonth").value;
                return searchMo ===""? "" : "files/" + searchMo + ".html"
            })
            , style: "display: none; width:1000px; height:100px"
            , onload: md => jobsCollect(md)
        }))
}

const PARSE_CHUNK_SIZE = 100

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
            clg('listing length', listing.length)
            progressBar.max = Math.floor( listing.length / PARSE_CHUNK_SIZE)+""
            parseListings( listing, tempJobs, PARSE_CHUNK_SIZE, progressBar)
        }
    }
}

function parseListings( listing, tempJobs, chunkSize, progressBar) {
    let total = listing.length
        , totchar =0
        , chunker = offset => {
        let jct = Math.min( total - offset, chunkSize)

        if (jct > 0) {
            for (jn = 0; jn < jct; ++jn) {
                let spec = jobSpec( listing[ offset + jn])

                if (spec.OK) {
                    let hnId = spec.hnId;

                    if (!UNote.dict[hnId]) {
                        UNote.dict[hnId] = new UserNotes({hnId: hnId});
                    }
                    tempJobs.push(spec)
                    totchar += JSON.stringify(spec).length;
                    //clg('totchar', jn, totchar)
                }
            }
            progressBar.value = progressBar.value + 1
            //window.requestAnimationFrame(() => chunker( offset + jct))

            if (tempJobs.length < 3)
                window.requestAnimationFrame(() => chunker( offset + jct))
            else {
                clg('fini!!!!!! load');
                progressBar.hidden = true
                hiringApp.jobs = tempJobs
            }
        } else {
            progressBar.hidden = true
            hiringApp.jobs = tempJobs
        }
    }
    chunker( 0);
}

function jobSpec(dom) {
    let spec = {hnId: dom.id}
    for (let n = 0; n < dom.children.length; ++n) {
        jobExtend( spec, dom.children[n], 0)
    }
    return spec
}

function jobSpecExtend(j, dom, depth) {
    let cn = dom.className;

    if (cn.length === 3 && "c5a,cae,c00,c9c,cdd,c73,c88".search(cn) !== -1) {
        let rs = dom.getElementsByClassName('reply');
        Array.prototype.map.call(rs, function (e) {
            e.remove()
        });

        let child = dom.childNodes
            , inHeader = true
            , titleSeg = [];

        if (child[0].nodeType === 3
            // && child[0].textContent.search("Instructure") !== -1
            && child[0].textContent.split("|").length > 1) {

            j.body = []

            for (let i = 0; i < child.length; i++) {
                n = child[i]

                if (inHeader) {
                    if (n.nodeType === 1 && n.nodeName === 'P') {
                        inHeader = false
                        j.body.push("<p>" + n.innerHTML + "</p>")
                    } else {
                        titleSeg.push(n)
                    }
                } else {
                    if (n.nodeType === 1) {
                        j.body.push("<p>" + n.innerHTML + "</p>");
                    } else if (n.nodeType === 3) {
                        j.body.push("<p>" + n.textContent + "</p>");
                    } else {
                        clg('lodernodetype bad ', n.nodeType);
                        j.body.push("")
                    }
                }
            }

            let htext = titleSeg.map(h => h.textContent).join(" | ")
                , hseg = htext.split("|").map(s => s.trim())

            let internOK = new RegExp(/((internship|intern)(?=|s,\)))/, 'i')
                , nointernOK = new RegExp(/((no internship|no intern)(?=|s,\)))/, 'i')
                , visaOK = new RegExp(/((visa|visas)(?=|s,\)))/, 'i')
                , novisaOK = new RegExp(/((no visa|no visas)(?=|s,\)))/, 'i')
                , onsiteOK = new RegExp(/(on.?site)/, 'i')
                , remoteOK = new RegExp(/(remote)/, 'i')
                , noremoteOK = new RegExp(/(no remote)/, 'i')
                , hsmatch = rx => hseg.some(hs => hs.match(rx) !== null);

            j.company = hseg[0]
            j.OK = true // || j.company.search("Privacy.com") === 0;

            j.titlesearch = htext
            j.bodysearch = j.body.map(n => n.textContent).join('<**>')
            j.onsite = hsmatch(onsiteOK)
            j.remote = (hsmatch(remoteOK) && !hsmatch(noremoteOK))
            j.visa = (hsmatch(visaOK) && !hsmatch(novisaOK))
            j.intern = (hsmatch(internOK) && !hsmatch(novisaOK))
        }
    }
    if (cn !== "reply") {
        for (var n = 0; n < dom.children.length; ++n) {
            clg('recur', dom.className, depth);
            jobSpecExtend(j, dom.children[n], depth + 1);
        }
    }
}


