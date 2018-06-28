goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.utility')
goog.provide('Hiring.jobListItem')

// --- jobList ------------------------

function jobList() {
    return ul({style: "list-style-type: none; background-color:#eee; padding:0; margin:0;"}
        , {
            name: "job-list"
            , selectedJobs: cF(c => {
                //clg('recomputing seljobs!!!!!!!!!!!!!!!!!!!');
                let rawjobs = c.md.fmUp("jobLoader").jobs
                    , seljobs = jobListFilter(c.md, rawjobs);
                // clg( 'got seljobs', seljobs.length)
                return seljobs
            })
            , kidValues: cF(c => {
                let go = pnow()
                    , jsort = jobListSort(c.md, c.md.selectedJobs) || []
                    , mxlim = c.md.fmUp("resultmax");
                plaps('got new sort afetr ', go)
                return jsort.slice(0, mxlim.results)
            })
            , kidKey: li => li.job.hnId
            , kidValueKey: job => job.hnId
            , kidFactory: jobListItem
        }
        , c => c.kidValuesKids())
}

// --- jobListItem ---------------------------------------------------------

const jumpToHN = hnId => window.open(`https://news.ycombinator.com/item?id=${hnId}`, '_blank');

function jobListItem(c, j) {
    //clg('rebuilding JLI!!!!!!!');
    return li({
            // shade alternate rows differently
            class: "jobli"
            , style: cF(c => {
                let uj = UNote.dict[j.hnId]
                    , viz = (uj.excluded
                    && !c.md.fmUp("showExcluded").onOff
                    && !c.md.fmUp("Excluded").onOff) ? "none;" : "block;";

                return "cursor:pointer;padding:12px;" + "display:" + viz + ";"
            })

            , onclick: mx => {
                let mol = mx.fmDown("showDetails")
                mol.onOff = !mol.onOff
            }
        }
        , {name: "job-listing", job: j}
        , jobHeader(j)
        , jobDetails(j)
    )
}

function jobHeader(j) {
    //return span( j.hnId)
    return div({
            style: "cursor:pointer; display:flex"
            , onclick: mx => {
                let mol = mx.fmDown("showDetails")
                mol.onOff = !mol.onOff
            }
        }
        , toggleFullListing()

        // if the job is collapsed so we cannot see the stars, at least
        // show one star iff there are any.
        , span({
                style: cF(c => {
                    let un = UNote.dict[j.hnId]
                        , mol = c.md.fmUp("showDetails");

                    return "color:red;max-height:16px;margin-right:9px; display:" +
                        ( ((mol.onOff || !un || !un.stars || un.stars === 0)) ? "none" : "block") // || (un && un.stars===0)
                })
            }
            , "&#x2b51")

        // .. and now the job header much as it appears on HN
        , span({
            onclick: mx => {
                let mol = mx.fmUp("showDetails")
                mol.onOff = !mol.onOff

            }
        }, j.titlesearch))
}

function jobDetails(j) {
    return div({
            class: cF(c => {
                let show = c.md.fmUp('showDetails').onOff;
                if (c.pv === kUnbound) {
                    return show ? "slideIn" : ""
                } else {
                    return show ? "slideIn" : "slideOut"
                }
            })
            , style: cF(c => "margin:6px;background:#fff; display:" + ( c.md.fmUp('showDetails').onOff ? "block" : "none"))

        }
        , userAnnotations(j)
        , div({
                style: "margin:6px;overflow:auto;"
                , ondblclick: mx => jumpToHN(j.hnId)
            }
            // here rather than toggling hidden we avoid even building the hidden
            // structure until the user requests it. Performance advantage merely guessed at.
            , c => c.md.fmUp("showDetails") ?
                j.body.map((n, x) => {
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
        , false, "", "" //"&#x25be", "&#x25b8"
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
    let sortBy = mx.fmUp("sortby").sortSpec

    return jobs.sort((j, k) => {
        let keyFn = sortBy.keyFn
            , compFn = sortBy.compFn
            , dir = sortBy.order;
        return compFn ? compFn(dir, j, k) :
            dir * (keyFn(j) < keyFn(k) ? -1 : 1)
    });
}

function jobHnIdKey(j) {
    return j.hnId
}

function jobCompanyKey(j) {
    return (j.company || '')
}

function jobStarsCompare(dir, j, k) {
    let uj = UNote.dict[j.hnId]
        , uk = UNote.dict[k.hnId];

    // regardless of sort direction,
    // force unstarred to end, in creation order
    if (uj.stars > 0) {
        if (uk.stars > 0) {
            return dir * (uj.stars < uk.stars ? -1 :
                (uj.stars > uk.stars ? 1 :
                    (uj.hnId < uk.hnId ? -1 : 1)))
        } else {
            return -1;
        }
    } else if (uk.stars > 0) {
        return 1;
    } else {
        return uj.hnId < uk.hnId ? -1 : 1
    }
}

