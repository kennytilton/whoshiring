goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.usernote')
goog.require('Hiring.jobDomParse')
goog.provide('Hiring.jobLoader')

// --- loading job data -----------------------------------------

const SEARCH_MO_IDX = 0;

function pickAMonth() {
    return div ({style: merge( hzFlexWrapCentered, {
            align_items: "center"
            , margin: "0px 0px 9px 24px"})}

        , select( {
                name: "searchMonth"
                , class: "searchMonth" // style: "font-size:1.5em; min-width:128px; margin:0 12px 6px 0;"
                , value: cI( gMonthlies[SEARCH_MO_IDX].hnId)
                , onchange: (mx,e) => {
                    let pgr = mx.fmUp("progress")
                    ast(pgr)
                    pgr.value = 0
                    pgr.maxN = 0
                    pgr.seen = new Set()
                    pgr.hidden = false
                    mx.value = e.target.value
                }}
            // --- use this if complaints about initial load ----
            // , option( {value: "none"
            //         , selected: "selected"
            //         , disabled: "disabled"}
            //     , "Pick a month. Any month.")
            , gMonthlies.map( (m,x) => option( {
                    value: m.hnId
                    , selected: x===SEARCH_MO_IDX? "selected":null}
                , m.desc)))

        , div( {style: hzFlexWrapCentered}
            , viewOnHN( cF( c=> `https://news.ycombinator.com/item?id=${c.md.fmUp("searchMonth").value}`)
                , { hidden: cF( c=> !c.md.fmUp("searchMonth").value)})
            , span({
                style: "margin: 0 12px 0 12px"
                , hidden: cF( c=> !c.md.fmUp("searchMonth").value)
                , content: cF(c => {
                    let pgr = c.md.fmUp("progress")
                        , jobs = c.md.fmUp("jobLoader").jobs || [];
                    return pgr.hidden ? "Total jobs: " + jobs.length
                        : "Parsing: "+ PARSE_CHUNK_SIZE * pgr.value})})

            , progress({
                max: cF( c=> c.md.maxN + "")
                , hidden: cF( c=> !c.md.fmUp("searchMonth").value)
                , value: cI(0)
            }, {
                name: "progress"
                , maxN: cI(0)
                , seen: cI( new Set())})

        ))
}


function jobListingLoader() {
    return div( {}
    , {
            name: "jobLoader"
            , jobs: cF(c => {
                let parts = c.md.kids.map(k => k.jobs);
                if (parts.every(p => p !== null)) {
                    //clg('all jobs resolved!!!!', parts.map( p => p.length))
                    let all = parts.reduce((accum, pj) => {
                        return accum.concat(pj)
                    });
                    return all;
                } else {
                    return null
                }
            }, {
                observer: (s,md,newv) => {
                    if ( newv) {
                        md.fmUp("progress").hidden = true;
                    }
                }
            })
        }
        , c=> {
            let selId = c.md.fmUp("searchMonth").value
                , moDef = gMonthlies.find( mo => mo.hnId === selId);

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
                    return `files/${hnId}/${hnId}.html`
                } else {
                    clg(`iframe seeking files/${hnId}/${pgNo}.html`)
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
    clg('collecting', md.pgNo)
    if (md.dom.contentDocument) {
        clg('collecting dom', md.pgNo)
        hnBody = md.dom.contentDocument.getElementsByTagName('body')[0];
        let chunkSize = PARSE_CHUNK_SIZE
            , listing = Array.prototype.slice.call(hnBody.querySelectorAll('.athing'))
            , tempJobs = []
            , pgr = md.fmUp("progress");

        if (listing.length > 0) {
            pgr.maxN = pgr.maxN + Math.floor( listing.length / PARSE_CHUNK_SIZE)
            parseListings( md, listing, tempJobs, PARSE_CHUNK_SIZE, pgr)
        } else {
            md.jobs = []
        }
    } else {
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
                let dom = listing[ offset + jn];

                if ( progressBar.seen.has( dom.id)) {
                    // clg('hnID already seen; NOT aborting pageNo', dom.id, md.pgNo, tempJobs.length)
                } else {
                    progressBar.seen.add(dom.id)

                    let spec = jobSpec(listing[offset + jn])

                    if (spec.OK) {
                        let hnId = spec.hnId;

                        spec.pgNo = md.pgNo;

                        if (!UNote.dict[hnId]) {
                            UNote.dict[hnId] = new UserNotes({hnId: hnId});
                        }
                        tempJobs.push(spec)
                    }
                }
            }
            progressBar.value = progressBar.value + 1
            //window.requestAnimationFrame(() => chunker( offset + jct))

            if (tempJobs.length < 30000)
                window.requestAnimationFrame(() => chunker( offset + jct))
            else {
                md.jobs = tempJobs;
                clg('page loaded', md.pgNo, tempJobs.length)
                frameZap(md);
                //clg('post dom zap!!', domAthings(md.dom).length);
            }
        } else {
            md.jobs = tempJobs;
            clg('page loaded', md.pgNo, tempJobs.length)
            frameZap(md);
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


