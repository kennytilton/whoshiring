goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.provide('Hiring.jobListItem')

// --- jobList ------------------------

function jobList () {
    return ul({style: "list-style-type: none; background-color:#eee; padding:0"}
        , {
            name: "job-list"
            , selectedJobs: cF(c => jobListFilter(c.md, hiringApp.jobs) || [])
            , kidValues: cF(c => {
                let jsort = jobListSort(c.md, c.md.selectedJobs) || []
                    , mxlim = c.md.fmUp("resultmax");
                return jsort.slice(0,mxlim.results)
            })
            , kidKey: li => li.job
            , kidFactory: jobListItem
        }
        , c => c.kidValuesKids())
}

// --- jobListItem ---------------------------------------------------------

function jobListItem(c, j) {
    return li({
        // shade alternate rows differently
            style: cF(c=> {
                let kn = c.md.fmUp("job-list").kidValues.indexOf(j)
                return "padding:4px;background-color:" + (kn % 2? "#f8f8f8":"#eee")
            })

            , onclick: mx=> {
                let mol = mx.fmDown("showDetails")
                mol.onOff = !mol.onOff
            }}
        , { name: "job-listing", job: j}
        , jobHeader(j)
        , jobDetails(j)
    )
}

function jobHeader(j) {
    return div( { style: "cursor:pointer;display:flex"}
        , toggleFullListing( )

        // if the job is collapsed so we cannot see the stars, at least
        // show one star iff there are any.
        , img( {src: "dist/star32.png"
            , style: cF( c=> {
                let un = UNote.dict[j.hnId]
                    , mol = c.md.fmUp("showDetails");

                return "max-height:16px;margin-right:9px; display:" +
                    ( ((mol.onOff || !un || !un.stars || un.stars === 0))? "none":"block") // || (un && un.stars===0)
            })})

        // .. and now the job header much as it appears on HN
        , span({onclick: mx=> {
            let mol = mx.fmUp("showDetails")
            mol.onOff = !mol.onOff
        }}, j.title.map(h => h.textContent).join(" | ")))
}

function jobDetails (j) {
    return div( {
            class: cF( c=> {
                let show = c.md.fmUp('showDetails').onOff;
                if (c.pv === kUnbound) {
                    return show ? "slideIn" : ""
                } else {
                    return show ? "slideIn" : "slideOut"
                }
            })
            , style: cF( c=> "margin:6px;background:#fff; display:"+ ( c.md.fmUp('showDetails').onOff? "block":"none"))

        }
        , userAnnotations(j)
        , div( { style: "margin:6px"}
            // here rather than toggling hidden we avoid even building the hidden
            // structure until the user requests it. Performance advantage only guessed at!
            , c=> c.md.fmUp("showDetails") ?
                j.body.map( (n,x) => {
                    if (n.nodeType === 1) { // Normal DOM
                        return "<p>" + n.innerHTML + "</p>"

                    } else if (n.nodeType === 3) { // string content
                        return "<p>" + n.textContent + "</p>"

                    } else {
                        clg('UNEXPECTED Node type', n.nodeType, n.nodeName, n.textContent)
                    }
                }) : null))
}

function toggleFullListing() {
    return toggleChar("showDetails", "Show/hide full listing"
        , false, "--", "+"
        , {class: "listing-toggle"}
        , {
            // cFI starts out formulaic to compute the initial value, but then
            // allows assignment as if it were a cI
            onOff: cFI(c => c.md.fmUp("expander").expanded)
        }
        , "margin-right:9px;")
}

// --- sorting ------------------------------------------------------

function jobListSort(mx, jobs) {
    let sortBy = mx.fmUp("sortby").selection

    return jobs.sort((j, k) => {
        let keyFn = sortBy.keyFn
            , compFn = sortBy.compFn
            , dir = sortBy.order;
        return compFn? compFn( dir, j, k) :
            dir * (keyFn(j) < keyFn(k) ? -1 : 1)
    });
}

function jobHnIdKey(j) {
    return j.hnId
}

function jobCompanyKey(j) {
    return (j.company || '')
}

function jobStarsCompare( dir, j, k) {
    let uj = UNote.dict[j.hnId]
        , uk = UNote.dict[k.hnId];
    if ( uj.stars > 0) {
        if ( uk.stars > 0) {
            clg('starcompare', j.company, k.company)
            return dir * (uj.stars < uk.stars ? -1 : 1)
        } else {
            clg('hard less on ujplus, ukzero', j.company, k.company)
            return -1;
        }
    } else if ( uk.stars > 0) {
        clg('hard GT on ujzero, ukplus', j.company, k.company)
        return 1;
    } else {
        return uj.hnId < uk.hnId ? -1 : 1
    }
}

