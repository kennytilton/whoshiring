goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Matrix.mxXHR')
goog.require('Hiring.utility')
goog.require('Hiring.usernote')
goog.require('Hiring.filtering')
goog.require('Hiring.jobLoader')
goog.require('Hiring.controlPanel')
goog.require('Hiring.jobListItem')
goog.require('Hiring.regexSearch')

// --- main ---------------------------------------

function WhoIsHiring() {
    return div(
        header(
            div( {
                class: "about"
                , onclick: mx=> mx.onOff = !mx.onOff
                , title: title
                , content: "about"
                }
                , { name: "appHelpToggle"
                    , onOff: cI( false)})
        , div( { class: "headermain"}
        , span( {class: "askhn"}, "Ask HN:")
        , span( {class: "who"}, "Who&rsquo;s Hiring?"))
    )
        , div( {
                style: "margin:0px; background:#ffb57d"
            }
            , appHelper()
            , jobListingLoader() // hidden iFrame where we load HN page for scraping
            , pickAMonth()
            , div( { class: cF( c=> slideInRule(c, c.md.fmUp("searchMonth").value))
                    , style: cF( c=> "display:" + (c.md.fmUp("searchMonth").value? "block":"none"))}
                , controlPanel()
                , jobList())
        ))
}

window['WhoIsHiring'] = WhoIsHiring;

// --- app header ---------------------------------------------

function appHelper () {
    return div( {style: hzFlexWrap}
        // , helpToggle( "appHelpToggle", "Show/hide app help")
        , appHelp())
}

// --- app help ----------------------------------------------

function appHelp () {
    return ul({
            class: cF( c=> "help " + slideInRule(c, c.md.fmUp("appHelpToggle").onOff))
            , style: cF( c=> "list-style:circle; display:" + (c.md.fmUp("appHelpToggle").onOff? "block":"none"))
        }
        , appHelpEntry.map( e=> li({style: "padding:6px;margin-bottom:9px;"}, e)))
}

const appHelpEntry = [
    "Click any job header to show or hide the full listing."
    , "All filters are ANDed except as you direct in RegExp fields."
    , "Your edits are kept in local storage, so stick to one browser."
    ,"Works off page scrapes taken every fifteen minutes. Ping kentilton at gmail if they seem stopped."
    , "RFEs welcome and can be raised " +
    "<a href='https://github.com/kennytilton/whoshiring/issues'>here</a>. "
    , "Built with <a href='https://github.com/kennytilton/matrix/blob/master/js/matrix/readme.md'>Matrix Inside</a>&trade;."
    , "This page is not affiliated with Hacker News, except..."
    , "..thanks to the HN crew for their assistance. All screw-ups remain " +
    "<a href='https://news.ycombinator.com/user?id=kennytilton'>kennytilton</a>'s."
    , "Graphic design by <a href='https://www.mloboscoart.com'>Michael Lobosco</a>. Implementation screw-ups are " +
    "Kenny's</a>."
]



