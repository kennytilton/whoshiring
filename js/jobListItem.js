goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.provide('Hiring.jobListItem')
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
        , "--", "+"
        , {class: "listing-toggle"}
        , {
            // cFI starts out formulaic to compute the initial value, but then
            // allows assignment as if it were a cI
            onOff: cFI(c => c.md.fmUp("expander").expanded)
        }
        , "margin-right:9px;")
}

function toggleChar ( name, title, onChar, offChar, attrs={}, locals={},style="") {
    return b( Object.assign( {
            style: "cursor:pointer; margin-left:9px; font-family:Arial; font-size:1em;"+style
            , onclick: mx => mx.onOff = !mx.onOff
            , title: title
            , content: cF( c=> c.md.onOff? onChar:offChar)
        }, attrs)
        , Object.assign( {
            name: name
            , onOff: false
        }, locals))
}
