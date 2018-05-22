goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.usernote')
goog.provide('Hiring.filtering')

// --- filtering and sorting ------------------------------------------------

function jobListFilter(mx, jobs) {

    let remoteok = mx.fmUp("REMOTE").onOff
        , visaok = mx.fmUp("VISA").onOff
        , internok = mx.fmUp("INTERN").onOff
        , starred = mx.fmUp("Starred").onOff
        , applied = mx.fmUp("Applied").onOff
        , noted = mx.fmUp("Noted").onOff
        , sortBy = mx.fmUp("sortby").selection
        , titleRgx = mx.fmUp("titlergx").rgxTree
        , listingRgx = mx.fmUp("listingrgx").rgxTree

    return jobs.filter(j => !remoteok || j.remote)
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

const hzFlexWrap = {
    display: "flex"
    , flex_wrap: "wrap"
}

function mkUserDefaults() {
    return div({ style: hzFlexWrap}
        , span({style: "min-width:80px"},
            "Defaults")
        , div( { style: hzFlexWrap}
            , uDefault.map( info => onOffCheckbox(info))))
}

function onOffCheckbox( nameTooltip) {
    let [ mxName, labelText, tooltip] = nameTooltip
        , uniq = Math.randomInt(100000);
    return div(
        input({
                id: mxName+"ID"+uniq
                , type: "checkbox"
                , style: "margin-left:18px"
                , checked: cF(c => c.md.onOff)
                , title: tooltip
                , onclick: mx => mx.onOff = !mx.onOff
            }
            , {
                name: mxName
                , onOff: cI(false)
            })
        , label( {
            for: name+"ID"+uniq
            , title: tooltip
        }, labelText))

}

const titleSelects = [["REMOTE", "Does regex search of title for remote jobs"]
    , ["INTERN", "Does regex search of title for internships"]
    , ["VISA", "Does regex search of title for Visa sponsors"]]

const userSelects = [["Starred", "Show only jobs you have rated with stars"]
    , ["Applied", "Show only jobs you have marked as applied to"]
    , ["Noted", "Show only jobs on which you have made a note"]]

function mkTitleSelects() {
    return mkJobSelects("Title selects", titleSelects)
}
function mkUserSelects() {
    return mkJobSelects("User selects", userSelects, {"margin-top":"8px"})
}

function mkJobSelects( lbl, jSelects, styling = {}) {
    return div({ style: merge( hzFlexWrap, {"align-items": "center", "min-height":"28px"}, styling)}
        , span({class: "selector"},
            lbl)
        , div( { style: hzFlexWrap}
            , jSelects.map( info => div( {style: "margin-right:18px"}
                , input({
                        id: info[0]+"ID"
                    , style: "margin-right:6px"
                        , type: "checkbox"
                        , checked: cF(c => c.md.onOff)
                        , title: info[1]
                        , onclick: mx => {
                            mx.onOff = !mx.onOff
                        }
                    }
                    , {name: info[0], onOff: cI(false)})
                , label( {
                    for: info[0]+"ID"
                    , title: info[1]
                }, info[0])))))
}

// --- sorting ------------------------------------------------------

function jobListSort(mx, jobs) {
    let sortBy = mx.fmUp("sortby").selection

    return jobs.sort((j, k) => {
        let keyFn = sortBy.keyFn
            , rawComp = (keyFn(j) < keyFn(k) ? -1 : 1);
        return sortBy.order * rawComp
    });

}

function jobHnIdKey(j) {
    return j.hnId
}

function jobCompanyKey(j) {
    return (j.company || '')
}

function jobStarsKey(j) {
    let uj = UNote.dict[j.hnId];
    return (uj && uj.stars) || 0;
}

