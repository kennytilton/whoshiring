goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.utility')
goog.require('Hiring.usernote')
goog.provide('Hiring.filtering')

// --- filtering and sorting ------------------------------------------------

function jobListFilter(mx, jobs) {
    if ( !jobs) return []
    //clg("jobListFilter sees job ct", jobs.length, jobs[0])

    let remoteok = mx.fmUp("REMOTE").onOff
        , onsiteok = mx.fmUp("ONSITE").onOff
        , visaok = mx.fmUp("VISA").onOff
        , internok = mx.fmUp("INTERNS").onOff
        , excluded = mx.fmUp("Excluded").onOff
        , starred = mx.fmUp("Starred").onOff
        , applied = mx.fmUp("Applied").onOff
        , noted = mx.fmUp("Noted").onOff
        , sortBy = mx.fmUp("sortby").selection
        , titleRgx = mx.fmUp("titlergx").rgxTree
        , listingRgx = mx.fmUp("listingrgx").rgxTree;


/*    if (titleRgx) {
        clg('inputs', jobs.length, titleRgx.join(',"'));

        jobs.map( j => {
        if (j.titlesearch.match( /skim/i )) {
            clg('BAM2', j.hnId, j.company, j.titlesearch)
        } else if (j.titlesearch.search("SKIM") !== -1) {
            clg('BAM3', j.hnId, j.company, j.titlesearch)
        } else if (rgxTreeMatch(j.titlesearch, titleRgx)) {
            clg('BAM4', j.company, j.titlesearch)
        }
    })}*/

    //return jobs.filter(j => !titleRgx || rgxTreeMatch(j.titlesearch, titleRgx))

    return jobs.filter(j => !remoteok || j.remote)
        .filter(j => !onsiteok || j.onsite)
        .filter(j => !visaok || j.visa)
        .filter(j => !internok || j.intern)
        .filter(j => !applied || UNote.dict[j.hnId].applied)
        .filter(j => excluded === UNote.dict[j.hnId].excluded)
        .filter(j => !starred || UNote.dict[j.hnId].stars > 0)
        .filter(j => !noted || UNote.dict[j.hnId].notes)

        .filter(j => !titleRgx || rgxTreeMatch(j.titlesearch, titleRgx))
        .filter(j => !listingRgx
            || rgxTreeMatch(j.titlesearch, listingRgx)
            || rgxTreeMatch(j.bodysearch, listingRgx))
}

function rgxTreeMatch(s, ors) {
    return ors.some(ands => ands.every(andx => s.match(andx)))
}

// --- filtering U/X ------------------------------------------------

const uDefault = [["udshowDetails", "Expand listings", "Show full listing or just the title"]]

function mkUserDefaults() {
    return div({ style: hzFlexWrap}
        , span({style: "min-width:80px"},
            "Defaults")
        , div( { style: hzFlexWrap}
            , uDefault.map( info => onOffCheckbox(info))))
}

const titleSelects = [["REMOTE", "Does regex search of title for remote jobs"]
    , ["ONSITE", "Does regex search of title for on-site jobs"]
    , ["INTERNS", "Does regex search of title for internships"]
    , ["VISA", "Does regex search of title for Visa sponsors"]]

const userSelects = [
    ["Excluded", "Show jobs you exluded from view"]
    , ["Starred", "Show only jobs you have rated with stars"]
    , ["Applied", "Show only jobs you have marked as applied to"]
    , ["Noted", "Show only jobs on which you have made a note"]]

function mkTitleSelects() {
    return mkJobSelects("title", "Title selects", titleSelects)
}

function mkUserSelects() {
    return mkJobSelects("user", "User selects", userSelects)
}

function mkJobSelects( key, lbl, jSelects, styling = {}) {
    return div( { style: merge( hzFlexWrap, {"margin":"8px 0 8px 24px"}, styling)}
        , jSelects.map( info => div( {style: "color: white; min-width:96px; align-items:center"}
            , input({
                    id: info[0]+"ID"
                    , class: key + "-jSelect"
                    , style: "background:#eee"
                    , type: "checkbox"
                    , checked: cF(c => c.md.onOff)
                    , title: info[1]
                    , onclick: mx => mx.onOff = !mx.onOff
                }
                , {name: info[0], onOff: cI(false)})
            , label( {
                for: info[0]+"ID"
                , title: info[1]
            }, info[0]))))
}

