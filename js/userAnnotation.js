goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.provide('Hiring.usernote')

//--- User Job Listing Annotations -------------
//
//
// ---- model / persistence --------------------

const UNOTE = "whoishiring.unote.";

// MXStorable.removeAllItems(UNOTE);

class UserNotes extends MXStorable {
    constructor(islots) {
        super(Object.assign({
                lsPrefix: UNOTE
            },
            islots,
            {
                hnId: islots.hnId
                , stars: cI(islots.stars || 0)
                , hidden: cI(islots.hidden || false) // todo lose this
                , excluded: cI(islots.excluded || false)
                , applied: cI(islots.applied || false)
                , notes: cI(islots.notes) // a little confusing since object is naned Notes
            }))
    }

    static storableProperties() {
        // created and deleted are provided by MXStorable
        return ["id", "hnId", "excluded", "stars", "hidden", "applied", "notes"].concat(super.storableProperties());
    }

    static loadFromStorage() {
        return mkm(null, 'JobList'
            , {
                dict: cF(c => {
                    let jd = {}
                        , jobs = MXStorable.loadAllItems(UserNotes, UNOTE) || [];
                    //clg('UNotes found', WhoIsHiring.length)
                    for (let jn = 0; jn < jobs.length; ++jn) {
                        let j = jobs[jn]
                        //clg('job Storage->dict', j.hnId)
                        jd[j.hnId] = j;
                    }

                    return jd;
                })
            })
    }
}

const UNote = UserNotes.loadFromStorage();

// ------ user annotations u/x --------------------------------------

function userAnnotations(j) {
    //clg('uannot', j.hnId, j.company)
    return div( {style: "display:flex; flex-direction: column"}
        , div ( { class: "userAnnotations"}
            //, excludeJob(j)
            , jobStars(j)
            , applied(j)
            , noteToggle(j)
            , viewOnHN(`https://news.ycombinator.com/item?id=${j.hnId}`))
        // beneath that
        , noteEditor(j))
}



// --- notes ---------------------------------------------

function noteToggle(j) {
    let unote = UNote.dict[j.hnId]

    return span({
            style: cF(c => {
                let c1 = ( unote.notes && unote.notes.length > 0) ? "cyan" : "#000"

                return "margin-left:18px; cursor:pointer;color:" +
                    ( unote.notes && unote.notes.length > 0 ? "#f00" : "#000")

            })
            , title: "Show/hide editor for your own notes"
            , onclick: mx => mx.editing = !mx.editing
        }, {name: "note-toggle", editing: cI( (unote.notes||"").length > 0 )}
        , "Notes")
}

function noteEditor (j) {
    let unote = UNote.dict[j.hnId]
    return textarea({
            class: cF( c=> slideInRule(c, c.md.fmUp("note-toggle").editing))
            , style: cF(c => "padding:8px;margin-left:12px;margin-right:12px;"
        + "display:" + (c.md.fmUp("note-toggle").editing ? "flex":"none"))
            // , cols: 20
            , placeholder: "Your notes here"
            , onchange: (mx, e) => unote.notes = e.target.value
        }
        , unote.notes || "")
}



// --- stars ----------------------------------------------

const MAX_STARS = 3;

function jobStars(j) {
    return div({style: hzFlexWrapCentered}
        , c => {
            let stars = [excludeJob(j)]
                , unote = UNote.dict[j.hnId];
            //clg('starring', j.hnId, j.company)
            for (let n = 0; n < MAX_STARS; ++n)
                stars.push( span({
                    content: "&#x2605"
                    , style: cF( c=> "cursor:pointer;color:" +
                        (unote.stars >= c.md.starN ? "red;":"gray;"))
                    , onclick: mx => {
                        let li = mx.fmUp("job-listing")
                        // clg('onclick!!!', li.id, unote.stars, j.hnId, j.company)
                        unote.stars = (unote.stars === mx.starN ? 0 : mx.starN);
                }}
                , {starN: n + 1}))
            return stars
        })
}

// --- exclude from view by default -----------------------------------

function excludeJob(j) {
    return span({
            content: "&#x20E0;"
            , style: cF( c=> {
                let unote = UNote.dict[j.hnId];
                return "margin-right:4px;font-size:1em;" +
                    (unote.excluded ? "color:red;font-weight:bolder" : "color:black")
            })
            , onclick: mx => {
                let unote = UNote.dict[j.hnId]
                    , newv = !(unote.excluded || false);
                clg('bam', (unote.excluded || false), newv)
                unote.excluded = newv
            }

        }
        , {name: "excluded?"})
}


// --- applied -----------------------------------------------

function applied(j) {
    return div({
            style: "display:flex; flex-wrap: wrap; align-items:center"
        }
        , input({
                id: "applied?"+j.hnId
                , type: "checkbox", style: "margin-left:18px"
                , checked: cF(c => {
                    let unote = UNote.dict[j.hnId];
                    return unote.applied || false
                })
                , onclick: mx => {
                    let unote = UNote.dict[j.hnId]
                        , newv = !unote.applied;
                    unote.applied = newv
                }

            }
            , {name: "applied?"}),
        label({for: "applied?"+j.hnId}, "Applied"))
}

