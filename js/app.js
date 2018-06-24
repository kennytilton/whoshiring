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
        appBanner()
        , div( {style: "margin:0px; background:#ffb57d"}
            , pickAMonth()
            , jobListingLoader() // hidden iFrames where we load HN page for scraping
            , controlPanel()
            , jobList()))
}

window['WhoIsHiring'] = WhoIsHiring;

function appBanner () {
    return div(
        header(
            div( {
                class: "about"
                , onclick: mx=> mx.onOff = !mx.onOff
                , title: "Usage hints, and credit where due."
                , content: cF( c=> c.md.onOff? "hide" : "Pro tips")
            }
            , {
                name: "appHelpToggle"
                , onOff: cI( false)
            })
            , div( { class: "headermain"}
                , span( {class: "askhn"}, "Ask HN:")
                , span( {class: "who"}, "Who&rsquo;s Hiring?")))
        , helpList(appHelpEntry,"appHelpToggle"))
}

const appHelpEntry = [
    "Click any job header to show or hide the full listing."

    , "Once visible, double-click the job description to open the listing on HN in a new tab."

    , "All filters are ANDed except as you direct within RegExp fields."

    , "Your annotations are kept in local storage, so stick to one browser."

    ,"Works off page scrapes taken every couple of hours." +
    " E-mail <a href='mailto:kentilton@gmail.com'>Kenny</a> if they seem stopped."

    , "RFEs welcome and can be raised " +
    "<a href='https://github.com/kennytilton/whoshiring/issues'>here</a>. "

    , "Built with <a href='https://github.com/kennytilton/matrix/blob/master/js/matrix/readme.md'>" +
    "Matrix Inside</a>&trade;."

    , "This page is not affiliated with Hacker News, but..."

    , "..thanks to the HN crew for their assistance. All screw-ups remain " +
    "<a href='https://news.ycombinator.com/user?id=kennytilton'>kennytilton</a>'s."

    , "Graphic design by <a href='https://www.mloboscoart.com'>Michael Lobosco</a>."
]



