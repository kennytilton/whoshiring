goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.usernote')
goog.provide('Hiring.regexSearch')

function mkTitleRgx() {
    return mkListingRgx('title', "Title Only", 'title')
}

function mkFullRgx() {
    return mkListingRgx('listing', "Full Listing", 'title and listing')
}

function mkListingRgx(prop, lbl, desc, debug) {
    return labeledRow(lbl, input({
        placeholder: `Regex for ${desc} search`
        , list: prop+"list"
        , onchange: buildRgxTree
        , onfocus: mx => mx.dom.setSelectionRange(0, mx.dom.value.length)
        , value: debug || ''
            // , style: "min-width:72px;width:300px;font-size:1em"
            , style: "min-width:72px;font-size:1em; height:2em"
    }, {
        name: prop + "rgx"
        , rgxRaw: cI(null)
        , rgxTree: cI(null)
        , history: cI([]) // todo localstorage
    })
    , datalist( {
            id: prop + "list"
        }
        , c=> c.md.fmUp(prop+"rgx").history.map( hs => option( {value: hs}))))
}

// todo lose this breakout
function labeledRow(label, ...children) {
    return div({
            style: {
                display: "flex"
                , flex_direction: "column"
                , margin: "6px 18px 0px 30px"

            }
        }
        , span({style: "color:white;font-size:0.7em"}, label)
        , children
    )
}

function mkRgxOptions () {
    return div(
        div({style: merge( hzFlexWrapCentered, {padding_right:"12px", margin: "4px 0 9px 30px"})}
            , mkRgxMatchCase()
            , mkRgxOrAnd()
            , helpToggle( "rgxHelpToggle", "Show/hide RegExp help"))
        , helpList(regexHelp,"rgxHelpToggle")
    )
}

function mkRgxMatchCase() {
    return div({
            style: "color: #fcfcfc; margin:0 9px 0 0; display:flex; flex-wrap: wrap; align-items:center"
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
function mkRgxOrAnd() {
    return div({
            style: "color: white; margin:0 9px 0 0; display:flex; flex-wrap: wrap; align-items:center"
            , title: "Replace 'or/and' with '||/&&' for easier mobile entry."

        }
        , input({
                id: "rgxOrAnd"
                , type: "checkbox"
                , checked: cF(c => c.md.value)
                , onclick: mx => mx.value = !mx.value
                , onchange: rebuildRgxTrees
                , title: "Replace 'or/and' with '||/&&' for easier mobile entry."
            }
            , {
                name: "rgxOrAnd"
                , value: cI( true)
            }),
        label({
            for: "rgxOrAnd"
            , title: "Replace 'or/and' with '||/&&' for easier mobile entry."
        }, "allow or/and"))
}

const regexHelp = [
    "Press <kbd style='background:cornsilk;font-size:1em'>Enter</kbd> or <kbd style='background:cornsilk;font-size:1em'>Tab</kbd> to activate, including after clearing."
    , "Separate <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions'>JS RegExp-legal</a> terms with <b>||</b> or " +
    "<b>&&</b> (higher priority) to combine expressions."
    , "'Allow or/and' option treats those as ||/&& for easier mobile entry."
    , "Regex terms are split on comma and passed to <code>new RegExp(pattern,flags)</code>."
    , "e.g. Enter <b>taipei,i</b> for case-insensitive search."
]

function buildRgxTree(mx, e) {
    mx.rgxRaw = e.target.value.trim()

    if (mx.rgxRaw === '') {
        mx.rgxTree = null // test
    } else {
        if (mx.history.indexOf( mx.rgxRaw) === -1) {
            //clg('adding to rgx!!!!', mx.rgxRaw)
            mx.history = mx.history.concat(mx.rgxRaw)
        }
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

// new RegExp(search, 'g')

function rebuildRgxTree( mx) {

    let matchCase = mx.fmUp("rgxMatchCase").value
        , cvtOrAnd = mx.fmUp("rgxOrAnd").value
        , rxor = RegExp(" or ", 'g')
        , rxand = RegExp(" and ", 'g')
        , search =  cvtOrAnd? mx.rgxRaw.replace(rxor," || ").replace(rxand," && ") : mx.rgxRaw
        // , search =  cvtOrAnd? mx.rgxRaw.replace(/\sor\s/," || ").replace(/\sand\s/," && ") : mx.rgxRaw

    clg("building from search str", search);


    mx.rgxTree = search.split('||').map(orx => orx.trim().split('&&').map(andx => {
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