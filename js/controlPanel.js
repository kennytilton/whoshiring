goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.utility')
goog.provide('Hiring.controlPanel')

function controlPanel() {
    return div(
        openShutCase("os-filters", "filters"
            // , "bingo"
            // , c=> c.md.fmUp("os-filters-toggle").onOff ? "filters":"filters-mass"
            , i({style: "margin-left:12px"
                , content: cF( c=> {
                //clg("echo runs",c.md.fmUp("os-filters-toggle").onOff)
                if (c.md.fmUp("os-filters-toggle").onOff) {
                    return ""
                } else {
                    let titles = document.getElementsByClassName('title-jSelect')
                        , users = document.getElementsByClassName('user-jSelect')
                        , ons = []
                        , echosChecked = doms => {
                        Array.prototype.map.call(doms, tog => {
                            clg('title!!!', dom2mx(tog).name, tog.id)
                            if (tog.checked) ons.push(dom2mx(tog).name)
                        })

                    };
                    echosChecked( titles)
                    echosChecked( users)
                    return ons.join(' ')
                }
            })})
            , mkTitleSelects, mkUserSelects )
        , openShutCase("rgx-filters", "search", span(""), mkTitleRgx, mkFullRgx)
        , openShutCase("job-sorts", "sorting", span(""), sortBar)
        , openShutCase("listing-controls", span(""), "view options", jobListingControlBar)
    )
}


window['controlPanel'] = controlPanel;

function pickAMonth() {
    return div ({style: merge( hzFlexWrap, {
            align_items: "center"
            , margin: "0px 0px 9px 24px"})}
        , select( {
                name: "searchMonth"
                , style: "min-width:128px;margin:0 12px 6px 0;"
                , value: cI( gMonthlies[0].hnId)
                , onchange: (mx,e) => {
                    mx.value = e.target.value
                }}
            , option( {value: "none"
                    // , selected: "selected"
                    , disabled: "disabled"}
                , "Pick a month. Any month.")
            , gMonthlies.map( (m,x) => option( {
                    value: m.hnId
                    , selected: x===0? "selected":null}
                , m.desc)))

        , div( {style: merge( hzFlexWrap)}
            , viewOnHN( )
            , span({
                style: "margin-left:12px"
                , hidden: cF( c=> !c.md.fmUp("searchMonth").value)
                , content: cF(c => {
                    let pgr = c.md.fmUp("progress")
                    return pgr.hidden ? "Jobs found: " + c.md.fmUp("job-list").selectedJobs.length
                        : "Parsing: "+ PARSE_CHUNK_SIZE * pgr.value})})

            , progress({
                max: cI(0)
                , hidden: cI( true)
                , value: cI(0)
            }, {name: "progress"})

        ))
}

function sortBar() {
    return ul({
                style: merge(hzFlexWrap, { padding:0, margin_left: "24px"})
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
                    , content: cF( c=> {
                        let currSel = c.md.fmUp("sortby").selection;;
                        if (currSel.keyFn === c.md.keyFn) {
                            return lbl+" "+ (currSel.order===-1 ? "&#x25bc;":"&#x25b2;")
                        } else {
                            return lbl
                        }
                    })
                }, {
                    keyFn: keyFn
                    , selected: cF(c => c.md.fmUp("sortby").selection.keyFn === keyFn)
                })))
}

function jobListingControlBar() {
    return div({style: merge( hzFlexWrap, {
            margin:"6px 0 0 24px"
            // , max_height: "16px"
            , align_items: "center"})}
        , resultMax()
        , span({ content: cF(c => {
            return "jobs of " + c.md.fmUp("job-list").selectedJobs.length + " after filtering."})})
        , button({
                style: cF(c=> {
                    let pgr = c.md.fmUp("progress")
                    return "margin-left:24px;display:"+ (pgr.hidden? "block":"none")
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
        , span("Display")
        , input({
                value: cF( c=> c.md.results)
                , style:"max-width:24px;margin-left:6px;margin-right:6px"
                , onchange: (mx,e) => mx.results = parseInt( e.target.value)
            }
            , {
                name: "resultmax"
                , results: cI( 42)}))
}

