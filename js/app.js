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

function merge(...maps) {
    return Object.assign({}, ...maps)
}
/*function WhoIsHiring() {
    return [header(
        span( {class: "askhn"}, "Ask HN:")
        , span( {class: "who"}, "Who's Hiring?")
    )
        , div ( {}, {name: "body"}
            , div( {class: "sideBar"}
                , jobListingLoader() // hidden iFrame where we load HN page for scraping
                , pickAMonth()
                , controlPanel())
            , div( {class: "results"}
                , resultsBar()
                , div( {
                        class: "resultsScroller"
                    }
                    , div( {
                            class: cF( c=> "resultsList " + slideInRule(c, c.md.fmUp("searchMonth").value))
                            , style: cF( c=> "display:" + (c.md.fmUp("searchMonth").value? "block":"none"))}
                        , jobList()))))
    ]
}*/
function WhoIsHiring() {
    return [header(
        span( {class: "askhn"}, "Ask HN:")
        , span( {class: "who"}, "Who&rsquo;s Hiring?")
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
        )]
}

window['WhoIsHiring'] = WhoIsHiring;

// --- app header ---------------------------------------------

function appHelper () {
    return div( {style: hzFlexWrap}
        , helpToggle( "appHelpToggle", "Show/hide app help")
        , appHelp())
}

// --- app help ----------------------------------------------

function appHelp () {
    return ul({
            class: cF( c=> "help " + slideInRule(c, c.md.fmUp("appHelpToggle").onOff))
            , style: cF( c=> "list-style:circle; display:" + (c.md.fmUp("appHelpToggle").onOff? "block":"none"))
        }
        , appHelpEntry.map( e=> li(e)))
}

const appHelpEntry = [
    "Click any job header to show or hide the full listing."
    , "All filters are ANDed."
    , "Your notes and stars are kept in local storage; stick to one browser."
    ,"Static page scrape may fall behind actual jobs during the early rush, so..."
    , "...clone the " +
    "<a href='https://github.com/kennytilton/whoshiring'>GitHub project</a> " +
    "and run yourself to control currency."
    , "RFEs welcome and can be raised " +
    "<a href='https://github.com/kennytilton/whoshiring/issues'>here</a>. "
    , "Built with <a href='https://github.com/kennytilton/matrix/blob/master/js/matrix/readme.md'>Matrix Inside&trade;</a>."
]



