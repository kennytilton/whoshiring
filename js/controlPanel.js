goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.provide('Hiring.controlPanel')

function controlPanel() {
    return div(
        pickAMonth()
        , mkTitleSelects()
        , mkTitleRgx()
        , mkFullRgx()
        , mkUserSelects()
        , sortBar()
        , jobListingControlBar()
        , progress({
            max: cI(0)
            , hidden: cI( null)
            , value: cI(0)
        }, {name: "progress"})
    )
}

window['controlPanel'] = controlPanel;

function pickAMonth() {
    return div(
        div ({style: "display:flex;margin-bottom:9px"}
            , span( {class: "selector"}, "Start here!!")
            , select( {name: "searchMonth"
                    , value: cI(null) // "16967543") //"files/whoishiring-2018-04.html"
                    , onchange: (mx,e) => {
                        mx.value = e.target.value
                    }}
                , option( {value: "none"
                        , selected: "selected"
                        , disabled: "disabled"}
                    , "Please pick a hiring month")
                , gMonthlies.map( m=> option( {value: m.hnId}, m.desc)))

        , p({style: cF( c=> "margin-left:24px;" + displayStyle(c.md.fmUp("searchMonth").value))}
            , i( { content: cF( c=> "<a href='https://news.ycombinator.com/item?id=" +
                    c.md.fmUp("searchMonth").value +
                    "'>View on HN</a>")}))))
}

function sortBar() {
    return div({style: merge( hzFlexWrap, {"align-items": "center"})}
        , span({ class: "selector"}
            , "Sort by")
        , ul({
                style: merge(hzFlexWrap, { padding:0})
            }
            , {
                name: "sortby"
                , selection: cI({keyFn: jobHnIdKey, order: -1})
            }
            , [["Creation", jobHnIdKey], ["Stars", jobStarsKey]
                , ["Company", jobCompanyKey]]
                .map(([lbl, keyFn]) => button({
                    style: cF(c => "margin-right:9px;min-width:72px;" + (c.md.selected ? "background:#ddf" : ""))
                    , onclick: mx => {
                        let currSel = mx.fmUp("sortby").selection;
                        clg('setting selection', mx.selection);
                        mx.fmUp("sortby").selection =
                            (currSel.keyFn === mx.keyFn ?
                                {keyFn: mx.keyFn, order: -currSel.order}
                                : {keyFn: mx.keyFn, order: 1});
                    }
                    , content: lbl
                }, {
                    keyFn: keyFn
                    , selected: cF(c => c.md.fmUp("sortby").selection.keyFn === keyFn)
                }))))
}


function jobListingControlBar() {
    return div({style: "display:flex;max-height:16px;align-items:center; background:lightgoldenrodyellow"}
        , resultMax()

        , span({ content: cF(c => {
            let pgr = c.md.fmUp("progress")
            return pgr.hidden ? "Jobs found: " + c.md.fmUp("job-list").selectedJobs.length
                : "Comments parsed: "+ PARSE_CHUNK_SIZE * pgr.value})})

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

function resultMax() {
    return div( {style: hzFlexWrap}
        , span("Display limit")
        , input({
                value: cF( c=> c.md.results)
                , style:"max-width:24px;margin-left:6px;margin-right:6px"
                , onchange: (mx,e) => mx.results = parseInt( e.target.value)
            }
            , {
                name: "resultmax"
                , results: cI( 42)}))
}

