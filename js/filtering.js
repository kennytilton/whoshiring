goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.utility')
goog.require('Hiring.usernote')
goog.provide('Hiring.filtering')

// --- filtering and sorting ------------------------------------------------

function jobListFilter(mx, jobs) {

    let remoteok = mx.fmUp("REMOTE").onOff
        , onsiteok = mx.fmUp("ONSITE").onOff
        , visaok = mx.fmUp("VISA").onOff
        , internok = mx.fmUp("INTERNS").onOff
        , starred = mx.fmUp("Starred").onOff
        , applied = mx.fmUp("Applied").onOff
        , noted = mx.fmUp("Noted").onOff
        , sortBy = mx.fmUp("sortby").selection
        , titleRgx = mx.fmUp("titlergx").rgxTree
        , listingRgx = mx.fmUp("listingrgx").rgxTree

    return jobs.filter(j => !remoteok || j.remote)
        .filter(j => !onsiteok || j.onsite)
        .filter(j => !visaok || j.visa)
        .filter(j => !internok || j.intern)
        .filter(j => !applied || UNote.dict[j.hnId].applied)
        .filter(j => !starred || UNote.dict[j.hnId].stars > 0)
        .filter(j => !noted || UNote.dict[j.hnId].notes)

        .filter(j => !titleRgx || rgxTreeMatch(j.titlesearch, titleRgx))
        .filter(j => !listingRgx
            || rgxTreeMatch(j.titlesearch, listingRgx)
            || rgxTreeMatch(j.bodysearch, listingRgx))
};

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

const userSelects = [["Starred", "Show only jobs you have rated with stars"]
    , ["Applied", "Show only jobs you have marked as applied to"]
    , ["Noted", "Show only jobs on which you have made a note"]]

function mkTitleSelects() {
    return mkJobSelects("title", "Title selects", titleSelects)
}
function mkUserSelects() {
    return mkJobSelects("user", "User selects", userSelects, {"margin-top":"8px"})
}

function mkJobSelects( key, lbl, jSelects, styling = {}) {
    return div( { style: merge( hzFlexWrap, {margin_left: "24px"})}
        , jSelects.map( info => div( {style: "min-width:124px"}
            , input({
                    id: info[0]+"ID"
                    , class: key + "-jSelect"
                    , style: ""
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

