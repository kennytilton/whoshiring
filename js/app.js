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
        },
        div( {style: hzFlexWrap}
            , span({style: "padding:4px;font-size:2em; margin-bottom:12px;background:orange"}
                , "Ask HN: Who Is Hiring?")
            , appHelpToggle())
        , appHelp()
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

function jobList () {
    return ul({style: "list-style-type: none; background-color:#eee; padding:0"}
        , {
            name: "job-list"
            , selectedJobs: cF(c => jobListFilter(c.md, hiringApp.jobs) || [])
            , kidValues: cF(c => {
                let jsort = jobListSort(c.md, c.md.selectedJobs) || []
                    , mxlim = c.md.fmUp("resultmax");
                return jsort.slice(0,mxlim.results)
            })
            , kidKey: li => li.job
            , kidFactory: jobListItem
        }
        , c => c.kidValuesKids())
}

// --- app help ----------------------------------------------

function appHelpToggle () {
    return helpToggle( "appHelpToggle", "Show/hide app help")
}

function helpToggle ( name, title) {
    return b({ style: "cursor:pointer; margin-left:9px; font-family:Arial; font-size:1em;"
            , onclick: mx => mx.onOff = !mx.onOff
            , title: title
            , content: cF( c=> c.md.onOff? "_":"?")
        }
        , { name: name
            , onOff: cI( false)})
}

const appHelpEntry = [
    "All filters are ANDed."
    , "RFEs welcome and can be raised " +
    "<a href='https://github.com/kennytilton/whoshiring/issues'>here</a>. "
    , "GitHub source can be " +
    "<a href='https://github.com/kennytilton/whoshiring'>" +
    "found here</a>."
]

function appHelp () {
    return ul({
            class: cF( c=> slideInRule(c, c.md.fmUp("appHelpToggle").onOff))
            , style: cF( c=> "display:" + (c.md.fmUp("appHelpToggle").onOff? "block":"none"))
        }
        , appHelpEntry.map( e=> li(e)))
}



