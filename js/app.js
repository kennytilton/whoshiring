goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Matrix.mxXHR')
goog.require('Hiring.usernote')
goog.require('Hiring.filtering')
goog.require('Hiring.jobListing')

const SLOT_CT = 5;

const hiringApp = new TagSession(null, 'HiringSession'
    , {
        jobs: cI([])
    });


// --- main ---------------------------------------

var tooManyJobsWarned = false;

function xhrJson( uri, options = {}) {
    return new mxXHR( uri, Object.assign( {
        send: true
        , delay: 0
        , responseType: 'json'
    }, options))
}

const wihUrl = "https://hacker-news.firebaseio.com/v0/user/whoishiring.json"

function hnItemUrl (id) {
    return `https://hacker-news.firebaseio.com/v0/item/${id}.json`
}

function WhoIsHiring() {
    return div( {
            style: "margin:0px;padding:36px"
        },
        div( {style: hzFlexWrap}
            , span({style: "padding:4px;font-size:2em; margin-bottom:12px;background:orange"}
                , "Ask HN: Who Is Hiring?")
            , appHelpOption())
        , appHelp()
        , controlPanel()

        , div({
            content: cF( c=> c.md.info)
            },
            {
                whoishiring: cF(c => xhrJson(wihUrl))
                , whsubmits: cF( c=> {
                    let who = c.md.whoishiring.okResult;
                    if (  who ) {
                        clg('bam wh sub5 ', who.id, who.submitted.slice(0,5))
                        who.submitted.slice(0,5).map( submit=> {
                            return xhrJson( hnItemUrl(submit)
                            , {okHandler: (s, xhr, r) => {
                                    if (r && r.title
                                        && r.title.match(new RegExp('hiring', 'i'))
                                    //&& r.title.match( new RegExp('November 2016','i'))
                                    ) {
                                        clg("got ask!!!", r.id, r.by, r.title, r.kids && r.kids.length)
                                        c.md.monthlyask = r

                                    }
                                } })
                        })
                    }})
                , monthlyask: cI(null)
                , listings: cF( c=> {
                    if ( ask = c.md.monthlyask) {
                        clg('ask!!!', ask.title, ask.kids.length)
                        return xhrJson( hnItemUrl(ask.kids[0])
                            , {okHandler: (s, xhr, r) => {
                                if (r && r.text) {
                                    clg("got job!!!", r.id, r.by, r.text)
                                    c.md.info = r.text
                                }
                            }})
                    } else {
                        clg('no ask-zero yet')
                    }
            })

                , info: cI("Hi mom")


            })

        //, jobList()
    )
}

window['WhoIsHiring'] = WhoIsHiring;

function processWhosHiring( s, m, j) {
    if (!j) return;
    let go = true;
    clg( 'phow', j.id, j.submitted.length)
    let cs = j.submitted.slice(0,300).map( cid=> {
        if (!go) return;
        return new mxXHR(`https://hacker-news.firebaseio.com/v0/item/${cid}.json`
            , {
                send: true
                , delay: 0, responseType: 'json'
                , okHandler: (s, xhr, r) => {
                    if (r) {
                        if (go && r.title
                            && r.title.match( new RegExp('hiring','i'))
                            //&& r.title.match( new RegExp('November 2016','i'))
                            ) {
                            //if (!r.kids)
                            clg("resp", r.id, r.by, r.title, r.kids && r.kids.length)
                            //go = false;
                            // r.kids.slice(10).map( k=> processStory( k))
                            //processWhosHiring( s, xhr, r)
                        }
                    }
                }
            })
    })
}

function processStory( storyId) {
    return new mxXHR(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
        , {
            send: true
            , delay: 0, responseType: 'json'
            , okHandler: (s, xhr, r) => {
                if (r) {
                    clg("listing", Date.now() - xhr.recd, xhr.recd -xhr.sent, r.by, r.title)
                }
            }
        })
}

function controlPanel() {
    return div(
        pickAMonth()
        , jobListingLoader()
        , mkJobSelects()
        , mkTitleRgx()
        , mkFullRgx()
        , sortBar()
        , jobCount()
        , progress({
            max: cI(0)
            , hidden: cI( null)
            , value: cI(0)
        }, {name: "progress"})
    )
}

function resultMax() {
    return div( {style: hzFlexWrap}
        , span("Limit")
        , input({
                value: cF( c=> c.md.results)
                , style:"max-width:24px;margin-left:6px;margin-right:6px"
                , onchange: (mx,e) => {
                    clg('macchag', e.target.value)
                    mx.results = parseInt( e.target.value)
                }}
            , {name: "resultmax"
                , results: cI( 42)}))
}

function jobCount() {
    return div({style: "display:flex;max-height:16px;align-items:center"}
        , resultMax()

        , span({ content: cF(c => {
            let pgr = c.md.fmUp("progress")
            return pgr.hidden ? "Jobs found: " + c.md.fmUp("job-list").selectedJobs.length
                : "Comments parsed: "+ 20 * c.md.fmUp("progress").value})})
        , button({
                style: cF(c=> {
                    let pgr = c.md.fmUp("progress")
                    return "max-height:16px; margin-left:24px;display:"+ (pgr.hidden? "block":"none")
                })
                , onclick: mx => {
                    let all = document.getElementsByClassName('listing-toggle');
                    Array.prototype.map.call(all, tog => tog.onOff = !mx.expanded)
                    mx.expanded = !mx.expanded
                }

                , content: cF( c=> c.md.expanded? "Collapse all":"Expand all")
            }
            , { name: "expander", expanded: cI(true)}))
}

function appHelpOption () {
    return i({
            class: "material-icons", style: "cursor:pointer; margin-left:9px"
            , onclick: mx => mx.onOff = !mx.onOff
            , title: "Show/hide app help"
            , content: cF( c=> c.md.onOff? "help":"help_outline")
        }
        , { name: "appHelpOption"
            , onOff: cI( false)})
}

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

const appHelpEntry = [
    "All filters are ANDed."
    , "RFEs welcome and can be raised " +
    "<a href='https://github.com/kennytilton/matrix/issues'>here</a>. "
    , "GitHub source can be " +
    "<a href='https://github.com/kennytilton/kennytilton.github.io/tree/master/whoishiring'>" +
    "found here</a>."
]

function appHelp () {
    return ul({
            class: cF( c=> slideInRule(c, c.md.fmUp("appHelpOption").onOff))
            , style: cF( c=> "display:" + (c.md.fmUp("appHelpOption").onOff? "block":"none"))
        }
        , appHelpEntry.map( e=> li(e)))
}

// --- jobListItem ---------------------------------------------------------

function jobListItem(c, j) {

    return li({
            style: cF(c=> {
                let kn = c.md.fmUp("job-list").kidValues.indexOf(j)
                return "padding:4px;background-color:" + (kn % 2? "#ffd":"#eee")
            })
            , onclick: mx=> {
                let mol = mx.fmDown("showListing")
                mol.onOff = !mol.onOff
            }}
        , { name: "job-listing", job: j}
        , div( { style: "cursor:pointer;display:flex"}
            , moreOrLess( )
            , span({onclick: mx=> {
                let mol = mx.fmUp("showListing")
                mol.onOff = !mol.onOff
            }}, j.title.map(h => h.textContent).join(" | ")))
        , div( {
                class: cF( c=> {
                    let show = c.md.fmUp('showListing').onOff;
                    if (c.pv === kUnbound) {
                        return show ? "slideIn" : ""
                    } else {
                        return show ? "slideIn" : "slideOut"
                    }
                })
                , style: cF( c=> "margin:6px;background:#fff; display:"+ ( c.md.fmUp('showListing').onOff? "block":"none"))

            }
            , userAnnotations(j)
            , div( { style: "margin:6px"}
                , c=> c.md.fmUp("showListing") ?
                    j.body.map( (n,x) => {
                    if (n.nodeType === 1) {
                        return "<p>" + n.innerHTML + "</p>"

                    } else if (n.nodeType === 3) {
                        return "<p>" + n.textContent + "</p>"

                    } else {
                        clg('UNEXPECTED Node type', n.nodeType, n.nodeName, n.textContent)
                    }
                }) : null)))
}

function moreOrLess () {
    return i({
        class: "listing-toggle material-icons"
        , style: "cursor:pointer;color:#888"
        , onclick: mx => {
            mx.onOff = !mx.onOff
        }
        , title: "Show/hide full listing"
        , content: cF( c=> c.md.onOff? "arrow_drop_down":"arrow_right")
    }, {
        name: "showListing"
        , onOff: cFI( c=> {
            let expander = c.md.fmUp("expander")
            return expander.expanded
        })
    })
}

