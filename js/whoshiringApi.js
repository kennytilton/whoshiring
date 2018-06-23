function whoshiringTester () {
    return div(
        {
            // content: cF(c => c.md.info)
        },
        {
            whoishiring: cF(c => xhrJson(wihUrl))
            , whsubmits: cF(c => {
            let who = c.md.whoishiring.okResult;
            if (who) {
                who.submitted.slice(0, 500).map(submit => {
                    return xhrJson(hnItemUrl(submit)
                        , {
                            okHandler: (s, xhr, r) => {
                                if (r && r.title
                                    && r.title.match(new RegExp('hiring', 'i'))
                                //&& r.title.match( new RegExp('November 2016','i'))
                                ) {
                                    let cre = new Date( r.time * 1000);
                                     if (cre.getFullYear()===2018 && cre.getMonth()===4) {
                                         clg('got feb 2018!!!!!!!!!!!', r.id)
                                         c.md.monthlyask = r
                                     }
                                }
                            }
                        })
                })
            }
        })
            , monthlyask: cIe(null)
            , listings: cF(c => {
            if (ask = c.md.monthlyask) {
                clg('ask!!!', ask.title, ask.kids.length)
                return ask.kids.slice(0,3).map( lid=> {
                    return xhrJson(hnItemUrl(lid)
                        , {
                            okHandler: (s, xhr, r) => {
                                if (r && r.text) {
                                    let p1 = r.text.search("<p>");

                                    if (p1 === -1) clg("no p")
                                    else {
                                        clg("got job!!!", r.id, r.by, p1)
                                        //c.md.info = r.text
                                    }
                                }
                            }
                        })
                })
            } else {
                clg('no ask-zero yet')
            }
        })
            , fini: cF( c => {
                let lgs = c.md.listings;
                if (lgs) {
                    clg('statuses', lgs.map( mxhr => mxhr.okResult !== null))
                    return lgs.every( lgxhr => lgxhr.okResult !== null)
                }
        })

            , info: cF( c=> {
                if ( c.md.fini) {
                    //return c.md.listings.map( lgxhr => div( { content: lgxhr.okResult.text}))
                    clg('info!', c.md.listings[0].okResult.text)
                    return c.md.listings // [0].okResult.text
                }
                // else {
                //     return ["loading..."]
                // }

        })


        }, c=> {
            if (c.md.info)
            return c.md.info.map( lg=> div({content: lg.okResult.text}))
            else
        return i("loading...")
        })
}



const wihUrl = "https://hacker-news.firebaseio.com/v0/user/whoishiring.json"

function hnItemUrl (id) {
    return `https://hacker-news.firebaseio.com/v0/item/${id}.json`
}

