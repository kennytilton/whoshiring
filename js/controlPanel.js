goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.require('Hiring.utility')
goog.provide('Hiring.controlPanel')

function controlPanel() {
    return div({style: "background-color:#ffb57d"}
        , openShutCase("os-filters", "Filters", true
            , i({
                style: "margin-left:12px"
                , content: cF(c => {
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
                        echosChecked(titles)
                        echosChecked(users)
                        return ons.join(' ')
                    }
                })
            })
            , mkTitleSelects, mkUserSelects)
        , openCase("rgx-filters", "Search"
            , mkTitleRgx, mkFullRgx, mkRgxOptions)

        , sortBar

        , jobListingControlBar
    )
}


window['controlPanel'] = controlPanel;

const jobSorts = [
    {title: "Creation", keyFn: jobHnIdKey, defaultOrder: -1}
    , {title: "Stars", compFn: jobStarsCompare, defaultOrder: -1}
    , {title: "Company", keyFn: jobCompanyKey, defaultOrder: 1}
]

function sortBar() {
    return div({
            style: {
                padding: "0 0 0 0", margin: "15px 0 0 24px"
                , display: "flex"
            }
        }
        , span("Sort &nbsp")
        , ul({
                style: merge(hzFlexWrap, {
                    padding: "0 0 0 0"
                    , margin: "0 0 0 0"
                })
            }
            , {
                name: "sortby"
                , order: cI(jobSorts[0].defaultOrder)
                , selection: cI(jobSorts[0])
                , sortSpec: cF(c => merge(c.md.selection, {order: c.md.order}))
            }
            , jobSorts.map(js => button({
                style: cF(c => "color:" + (c.md.selected ? "blue" : "#222"))
                , class: "sortOption"
                , selected: cF(c => c.md.par.selection.title === js.title)
                , onclick: mx => {
                    let currSel = mx.par.selection;
                    if (currSel.title === js.title) {
                        mx.par.order = -mx.par.order;
                    } else {
                        mx.par.selection = js
                    }
                }
                , content: cF(c => {
                    let spec = c.md.par.sortSpec;
                    ;
                    if (spec.title === js.title) {
                        return js.title + (spec.order === -1 ? " &#x2798" : " &#x279a")
                    } else {
                        return js.title + " &nbsp;"
                    }
                })
            })))
    )
}

function jobListingControlBar() {
    return div({
            style: merge(hzFlexWrapCentered, {
                margin: "12px 0 0 0px"
                , font_size: "1em"
                , padding: "4px"
                , border_style: "groove"
                , border_color: "khaki"
                , border_width: "2px"
                , background: "PAPAYAWHIP"
                , justify_content: "space-between"
                , align_items: "center"
            })
        }

        , div({style: merge(hzFlexWrapCentered, {flex_wrap: "wrap"})}
            , span({
                style: "font-size:1em;margin-right:12px"
                , content: cF(c => "Jobs: " + c.md.fmUp("job-list").selectedJobs.length)
            })
            , span({
                style: cF(c => "padding-bottom:4px;cursor:pointer;display:flex;align-items:center;font-size:1em;visibility:" + (c.md.excludedCt > 0 ? "visible;" : "hidden;") +
                    "border:" + (c.md.onOff ? "thin solid red;" : "none;"))
                , content: cF(c => "&#x20E0;: " + c.md.excludedCt)
                , onclick: md => md.onOff = !md.onOff
                , title: "Show/hide items you have excluded"
            }, {
                name: "showExcluded"
                ,
                onOff: cI(false)
                ,
                excludedCt: cF(c => c.md.fmUp("job-list").selectedJobs.filter(j => UNote.dict[j.hnId].excluded).length)
            }))
        , resultMax()
        , button({
                style: cF(c => {
                    let pgr = c.md.fmUp("progress")
                    return "font-size:1em; min-width:96px; display:" + (pgr.hidden ? "block" : "none")
                })
                , onclick: mx => {
                    let all = document.getElementsByClassName('listing-toggle');
                    Array.prototype.map.call(all, tog => tog.onOff = !mx.expanded)
                    mx.expanded = !mx.expanded
                }

                , content: cF(c => c.md.expanded ? "Collapse All" : "Expand All")
            }
            , {name: "expander", expanded: cI(!mobileCheck())}))
}

var RESULT_MAX = 42;

function resultMax() {
    return div({style: merge(hzFlexWrapCentered, {margin_right: "6px"})}
        , span({}, "Show:")
        , input({
                value: cF(c => c.md.results)
                , style: "font-size:1em;max-width:48px;margin-left:6px;margin-right:6px"
                , onchange: (mx, e) => mx.results = parseInt(e.target.value)
            }
            , {
                name: "resultmax"
                , results: cI(RESULT_MAX)
            }))
}

