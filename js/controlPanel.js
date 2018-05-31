goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.utility')
goog.provide('Hiring.controlPanel')

function controlPanel() {
    return div(
        openShutCase("os-filters", "filters", true
             , i({style: "margin-left:12px"
                , content: cF( c=> {
                if (c.md.fmUp("os-filters-toggle").onOff) {
                    return ""
                } else {
                    let titles = document.getElementsByClassName('title-jSelect')
                        , users = document.getElementsByClassName('user-jSelect')
                        , ons = []
                        , echosChecked = doms => {
                        Array.prototype.map.call(doms, tog => {
                            if (tog.checked) ons.push(dom2mx(tog).name)
                        })

                    };
                    echosChecked( titles)
                    echosChecked( users)
                    return ons.join(' ')
                }
            })})
            , mkTitleSelects, mkUserSelects )
        , openShutCase("rgx-filters", "search", false
            , i({style: "margin-left:12px"
                , content: cF( c=> {
                    if (c.md.fmUp("rgx-filters-toggle").onOff) {
                        return ""
                    } else {
                        let rgxs = document.getElementsByClassName("listing-regex")
                            , ons = [];
                        Array.prototype.map.call(rgxs, rgx => {
                            if ( rgx.value) ons.push( rgx.value)
                        });

                        return ons.join(' and ')
                    }
                })})
            , mkTitleRgx, mkFullRgx, mkRgxOptions)

        , openShutCase("job-sorts", "sorting", false
            , i({style: "margin-left:12px"
                , content: cF( c=> {
                    if (c.md.fmUp("job-sorts-toggle").onOff) {
                        return ""
                    } else {
                        let s = c.md.fmUp("sortby").selection;
                        return s.title + " " + (s.order === -1? "&#x2798":"&#x279a")
                    }
                })})
            , sortBar)

        , jobListingControlBar
    )
}


window['controlPanel'] = controlPanel;



const jobSorts = [
    {title: "Creation", keyFn: jobHnIdKey}
    , {title: "Stars", compFn: jobStarsCompare}
    , {title: "Company", keyFn: jobCompanyKey}
    ]

function sortBar() {
    return ul({
            style: merge(hzFlexWrap, { padding:0, margin_left: "24px"})
        }
        , {
            name: "sortby"
            , order: cI( 1)
            , selection: cI( jobSorts[0])
            , sortSpec: cF( c=> merge( c.md.selection, {order: c.md.order}))
        }
        , jobSorts.map(js => button({
            selected: cF(c => c.md.par.selection.title === js.title)
            , style: cF(c => "margin-right:9px;min-width:72px;" + (c.md.selected ? "background:#ddf" : ""))
            , onclick: mx => {
                let currSel = mx.par.selection;
                if ( currSel.title === js.title ) {
                    mx.par.order = -mx.par.order;
                } else {
                    mx.par.selection = js
                }
            }
            , content: cF( c=> {
                let spec = c.md.par.sortSpec;;
                if (spec.title === js.title) {
                    return js.title + " sort " + (spec.order===-1 ? "&#x2798":"&#x279a")
                } else {
                    return js.title
                }
            })
        })))
}

function jobListingControlBar() {
    return div({
            style: merge( hzFlexWrapCentered, {
                margin:"12px 0 0 0px"
                , padding: "6px"
                , border_style: "ridge"
                , border_color: "khaki"
                , border_width: "2px"
                , background: "#f8f8f8"
                , justify_content: "space-between"
                , align_items: "center"})}

        , span({ content: cF(c => "Matches: " + c.md.fmUp("job-list").selectedJobs.length)})
        , resultMax()
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
    return div( {style: merge( hzFlexWrap, {margin_left: "18px"})}
        , span("Display limit:")
        , input({
                value: cF( c=> c.md.results)
                , style:"max-width:24px;margin-left:6px;margin-right:6px"
                , onchange: (mx,e) => mx.results = parseInt( e.target.value)
            }
            , {
                name: "resultmax"
                , results: cI( 42)}))
}

