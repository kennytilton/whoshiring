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
        , onkeypress: buildRgxTree
        , onchange: buildRgxTree
        , value: ''
        , style: "min-width:72px;width:300px;font-size:1em"
    }, {
        name: prop + "rgx"
        , rgxTree: cI(null)
    }))
}

function labeledRow(label, ...children) {
    return div({
            style: {
                display: "flex"
                , flex_wrap: "wrap"
                , "margin" : "9px 0px 0px 24px"
                , "align-items": "center"
            }
        }
        , {helping: cI(false)}
        , span({style: "min-width:104px"}, label)
        , children
        , b({ style: "cursor:pointer; margin-left:9px; font-family:Arial; font-size:1em;"
            , onclick: mx => mx.par.helping = !mx.par.helping
            , title: "Show/hide help"
            , content: cF( c=> c.md.par.helping? "_":"?")
        })

        , ul( {
                class: cF( c=> slideInRule(c, c.md.par.helping))
                ,style: cF( c=> "display:" + (c.md.par.helping? "block":"none"))
            }
            , regexHelp.map( h=> li(h))))
}

const regexHelp = [
    "Separate <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions'>JS RegExp-legal</a> terms with <b>||</b> or " +
    "<b>&&</b> (higher priority) to combine expressions."
    , "Press <kbd style='font-size:1.4em'>Enter</kbd> or <kbd style='font-size:1.4em'>Tab</kbd> to activate, including after clearing."
    , "Supply RegExp options after a comma. e.g. <b>taipei,i</b> for case-insensitive search."]

function buildRgxTree(mx, e) {
    if (!(e.type === 'change' || (e.type==='keypress' && e.key === 'Enter')))
        return

    let rgx = e.target.value.trim()

    if (rgx === '') {
        mx.rgxTree = null // test
        return
    }

    mx.rgxTree = rgx.split('||').map(orx => orx.trim().split('&&').map(andx => {
        try {
            let [term, options=''] = andx.trim().split(',')
            return new RegExp( term, options)
        }
        catch (error) {
            alert(error.toString() + ": <" + andx.trim() + ">")
        }
    }))
}