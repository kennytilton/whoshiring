goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.usernote')
goog.provide('Hiring.regexSearch')

function mkTitleRgx() {
    return mkListingRgx('title', "Title Only", 'title', true)
}

function mkFullRgx() {
    return mkListingRgx('listing', "Full Listing", 'title and listing')
}

function mkListingRgx(prop, lbl, desc) {
    return labeledRow(lbl, input({
        placeholder: `Regex for ${desc} search`
        , class: "listing-regex"
        , onkeypress: buildRgxTree
        , onchange: buildRgxTree
        , value: ''
        , style: "min-width:72px;width:300px;font-size:1em"
    }, {
        name: prop + "rgx"
        , rgxRaw: cI(null)
        , rgxTree: cI(null)
    }))
}

function mkRgxOptions () {
    return div(
        div({style: merge( hzFlexWrapCentered, {margin: "4px 96px 20px 12px"})}
            , helpToggle( "rgxHelpToggle", "Show/hide app help")
            , mkRgxMatchCase())

        , ul({
                class: cF(c => slideInRule(c, c.md.fmUp("rgxHelpToggle").onOff))
                , style: cF(c => "display:" + (c.md.fmUp("rgxHelpToggle").onOff ? "block" : "none"))
            }
            , regexHelp.map(h => li(h))))
}

function mkRgxMatchCase() {
    return div({
            style: "margin-left:88px; display:flex; flex-wrap: wrap; align-items:center"
        }
        , input({
                id: "rgxMatchCase"
                , type: "checkbox"
                , onclick: mx => mx.value = !mx.value
                , onchange: rebuildRgxTrees
            }
            , {
                name: "rgxMatchCase"
                , value: cI( false)
            }),
        label({for: "rgxMatchCase"}, "match case"))
}

// todo lose this breakout
function labeledRow(label, ...children) {
    return div({
            style: {
                display: "flex"
                , flex_wrap: "wrap"
                , "margin" : "9px 0px 0px 24px"
                , "align-items": "center"
            }
        }
        , span({style: "min-width:104px"}, label)
        , children
    )
}

const regexHelp = [
    "Press <kbd style='background:cornsilk;font-size:1em'>Enter</kbd> or <kbd style='background:cornsilk;font-size:1em'>Tab</kbd> to activate, including after clearing."
    , "Separate <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions'>JS RegExp-legal</a> terms with <b>||</b> or " +
    "<b>&&</b> (higher priority) to combine expressions."
    , "Regex terms are split on comma and passed to <code>new RegExp(pattern,flags)</code>."
    , "e.g. Enter <b>taipei,i</b> for case-insensitive search."
]

function buildRgxTree(mx, e) {
    if (!(e.type === 'change' || (e.type === 'keypress' && e.key === 'Enter')))
        return

    mx.rgxRaw = e.target.value.trim()

    if (mx.rgxRaw === '') {
        mx.rgxTree = null // test
    } else {
        rebuildRgxTree(mx)
    }
}

function rebuildRgxTrees( mx) {
    ["titlergx", "listingrgx"].map( n => {
        let rgmx = mx.fmUp(n);
        if ( rgmx.rgxTree)
            rebuildRgxTree(rgmx )
    })
}

function rebuildRgxTree( mx) {

    let matchCase = mx.fmUp("rgxMatchCase").value

    mx.rgxTree = mx.rgxRaw.split('||').map(orx => orx.trim().split('&&').map(andx => {
        try {
            let [term, options=''] = andx.trim().split(',')
            if ( !matchCase && options.search('i') === -1)
                options = options + 'i'
            return new RegExp( term, options)
        }
        catch (error) {
            alert(error.toString() + ": <" + andx.trim() + ">")
        }
    }))
}