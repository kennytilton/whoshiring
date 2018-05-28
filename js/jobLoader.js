goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.usernote')
goog.require('Hiring.jobDomParse')
goog.provide('Hiring.jobLoader')

// --- loading job data -----------------------------------------

function myRange( start, end) {
    if (start === undefined) {
        return []
    } else if ( end === undefined) {
        return myRange( 0, start)
    } else {
        let r = []
        for (n = start; n < end; ++n) {
            r.push(n)
        }
        return r
    }
}

function jobListingLoader() {
    return div( {}
    , {
            name: "jobLoader"
            , jobs: cF(c => {
                let parts = c.md.kids.map(k => k.jobs);
                if (parts.every(p => p !== null)) {
                    clg('all jobs resolved!!!!')
                    let all = parts.reduce((accum, pj) => {
                        return accum.concat(pj)
                    });
                    return all;
                } else {
                    return null
                }
            })
        }
        , c=> {
            let selId = c.md.fmUp("searchMonth").value
                , moDef = gMonthlies.find( mo => mo.hnId === selId);
            ast( moDef);
            clg('modef', JSON.stringify(moDef), moDef.pgCount)

            if (moDef.pgCount > 0) {
                return myRange( moDef.pgCount).map( pgn=> {
                    return mkPageLoader( c.md, moDef.hnId, pgn+1)
                })
            } else {
                return mkPageLoader( c.md, moDef.hnId)
            }
        })
}

function mkPageLoader( par, hnId, pgNo) {
    return iframe({
            src: cF(c => {
                if  (hnId === null) {
                    clg('no modef.hnId!!!', par.pgNo, pgNo)
                    return ""
                } else if ( pgNo === undefined) {
                    clg('src=', `files/${hnId}/${hnId}.html`)
                    return `files/${hnId}/${hnId}.html`
                } else {
                    return `files/${hnId}/${pgNo}.html`
                }
            })
            , style: "display: none"
            , onload: md => jobsCollect(md)
        }
        , {
            jobs: cI( null)
            , pgNo: pgNo
        }
    )
}

const PARSE_CHUNK_SIZE = 100

function domAthings( dom) {
    let hnBody = dom.contentDocument.getElementsByTagName('body')[0]
    return Array.prototype.slice.call(hnBody.querySelectorAll('.athing'))
}

function jobsCollect(md) {
    clg('collecting')
    if (md.dom.contentDocument) { // FF
        clg('normal dom!!!', md.pgNo, domAthings(md.dom).length);

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
            parseListings( md, listing, tempJobs, PARSE_CHUNK_SIZE, progressBar)
        } else {
            clg('no jobs!!', md.pgNo)
            md.jobs = []
        }
    } else {
        clg('no content', md.pgNo)
        md.jobs = [];
    }
}

function parseListings( md, listing, tempJobs, chunkSize, progressBar) {
    let total = listing.length
        , totchar =0
        , chunker = offset => {
        let jct = Math.min( total - offset, chunkSize)
        //clg('chunker', jct, total, offset)

        if (jct > 0) {
            for (jn = 0; jn < jct; ++jn) {
                let spec = jobSpec( listing[ offset + jn])

                if (spec.OK) {
                    let hnId = spec.hnId;

                    spec.pgNo = md.pgNo;

                    if (!UNote.dict[hnId]) {
                        UNote.dict[hnId] = new UserNotes({hnId: hnId});
                    }
                    tempJobs.push(spec)
                    // clg('spec!!!!!', JSON.stringify(spec))
                    // totchar += JSON.stringify(spec).length;
                    // clg('totchar', jn, totchar)
                }
            }
            progressBar.value = progressBar.value + 1
            //window.requestAnimationFrame(() => chunker( offset + jct))

            if (tempJobs.length < 30000)
                window.requestAnimationFrame(() => chunker( offset + jct))
            else {
                // clg('fini!!!!!! load', md.pgNo, tempJobs.length);
                progressBar.hidden = true
                // hiringApp.jobs = tempJobs
                md.jobs = tempJobs;
                frameZap(md);
                //clg('post dom zap!!', domAthings(md.dom).length);
            }
        } else {
            // clg('fini!!!2!!! load', md.pgNo, tempJobs.length);
            progressBar.hidden = true
            md.jobs = tempJobs;
            frameZap(md);
            //clg('post dom zap', domAthings(md.dom).length, md.jobs.length);
        }
    }
    chunker( 0);
}

function frameZap( md ) {
    b = md.dom.contentDocument.getElementsByTagName('body')[0];
    b.innerHTML = "";
}

function jobSpec(dom) {
    let spec = {hnId: dom.id}
    for (let n = 0; n < dom.children.length; ++n) {
        jobSpecExtend( spec, dom.children[n], 0)
    }
    return spec
}


