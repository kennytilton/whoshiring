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

const SLOT_CT = 5;

const hiringApp = new TagSession(null, 'HiringSession'
    , {
        jobs: cI([])
    });


// --- main ---------------------------------------

function merge(...maps) {
    return Object.assign({}, ...maps)
}

function WhoIsHiring() {
    return div( {
            style: "margin:0px;padding:36px;"
        }
        , appHeader()
        , jobListingLoader() // hidden iFrame where we load HN page for scraping
        , pickAMonth()
        , div( { class: cF( c=> slideInRule(c, c.md.fmUp("searchMonth").value))
                , style: cF( c=> "display:" + (c.md.fmUp("searchMonth").value? "block":"none"))}
            , controlPanel()
            //, whoshiringTester()
            , jobList())
    )
}

window['WhoIsHiring'] = WhoIsHiring;

// --- app header ---------------------------------------------

function appHeader () {
    return div( {style: hzFlexWrap}
        , span({style: "padding:4px;font-size:1.5em; margin-bottom:12px;background:orange"}
            , "Ask HN: Who Is Hiring?")
        , helpToggle( "appHelpToggle", "Show/hide app help")
        , appHelp())
}

// --- app help ----------------------------------------------

const appHelpEntry = [
    "Click/tap any job to show/hide full listing"
    , "All filters are ANDed."
    ,"Static page scrape will fall behind actual jobs during the early rush, so..."
    , "...clone the " +
    "<a href='https://github.com/kennytilton/whoshiring'>GitHub project</a> " +
    "and run yourself to control currency."
    , "RFEs welcome and can be raised " +
    "<a href='https://github.com/kennytilton/whoshiring/issues'>here</a>. "
]

function appHelp () {
    return ul({
            class: cF( c=> slideInRule(c, c.md.fmUp("appHelpToggle").onOff))
            , style: cF( c=> "display:" + (c.md.fmUp("appHelpToggle").onOff? "block":"none"))
        }
        , appHelpEntry.map( e=> li(e)))
}



