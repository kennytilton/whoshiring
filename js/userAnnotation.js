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
                , stars: cI(islots.stars) // null OK
                , hidden: cI(islots.hidden || false)
                , applied: cI(islots.applied || false)
                , notes: cI(islots.notes) // a little confusing since object is naned Notes
            }))
    }

    static storableProperties() {
        // created and deleted are provided by MXStorable
        return ["id", "hnId", "stars", "hidden", "applied", "notes"].concat(super.storableProperties());
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
        , div ({style: "display:flex; flex-wrap:wrap; align-items:center"}
            , jobStars(j)
            , applied(j)
            , noteToggle(j)
            , a({
                    style: "margin-left:6px"
                    , href: `https://news.ycombinator.com/item?id=${j.hnId}`
                    , title: "View listing on the HN site"}
                , img({ src: "dist/hn24.jpg"})))
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
        , "Memo")
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

const MAX_STARS = 5;

function jobStars(j) {
    return div({style: "margin-left:6px; display:flex; flex-wrap:wrap"}
        , c => {
            let stars = []
                , unote = UNote.dict[j.hnId];
            //clg('starring', j.hnId, j.company)
            for (let n = 0; n < MAX_STARS; ++n)
                stars.push( img({
                    src: cF( c=> unote.stars >= c.md.starN ? "dist/star32.png":"dist/star32off.png")
                    , style: "cursor:pointer;"
                    , onclick: mx => {
                        let li = mx.fmUp("job-listing")
                        clg('onclick!!!', li.id, unote.stars, j.hnId, j.company)
                        unote.stars = (unote.stars === mx.starN ? 0 : mx.starN);
                }}
                , {starN: n + 1}))
            return stars
        })
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