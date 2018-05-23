goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.provide('Hiring.utility')

function toggleChar ( name, title, initialState, onChar, offChar, attrs={}, locals={},style="") {
    return b( Object.assign( {
            style: "cursor:pointer; margin-left:9px; font-family:Arial; font-size:1em;"+style
            , onclick: mx => mx.onOff = !mx.onOff
            , title: title
            , content: cF( c=> c.md.onOff? onChar:offChar)
        }, attrs)
        , Object.assign( {
            name: name
            , onOff: cI( initialState)
        }, locals))
}

function displayStyle( visible, notVisValue = "none") {
    return "display:" + (visible ? "block" : notVisValue) + ";"
}

function slideInRule( c, show) {
    if (c.pv === kUnbound) {
        return show ? "slideIn" : ""
    } else {
        return show ? "slideIn" : "slideOut"
    }
}


function openShutCase( name, title, echo, ...cases) {
    let toggleName = name+"-toggle";
    return div(
        div({class: "selector", style: hzFlexWrap}
            , toggleChar( toggleName, "Show/hide "+title, title==="sorting", "--", "+")
            , span( {style: "margin-left:9px"}, title)
            , echo)
        , div( {
                class: cF( c=> slideInRule(c, c.md.fmUp(toggleName).onOff))
                , style: cF( c=> "display:" + (c.md.fmUp(toggleName).onOff? "block":"none"))}
            , cases.map( c=> c())))
}

function onOffCheckbox( nameTooltip) {
    let [ mxName, labelText, tooltip] = nameTooltip
        , uniq = Math.randomInt(100000);
    return div(
        input({
                id: mxName+"ID"+uniq
                , type: "checkbox"
                , style: "margin-left:18px"
                , checked: cF(c => c.md.onOff)
                , title: tooltip
                , onclick: mx => mx.onOff = !mx.onOff
            }
            , {
                name: mxName
                , onOff: cI(false)
            })
        , label( {
            for: name+"ID"+uniq
            , title: tooltip
        }, labelText))

}

const hzFlexWrap = {
    display: "flex"
    , flex_wrap: "wrap"
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

function viewOnHN ( uri) {
    return a({
            style: "margin-left:12px"
            , href: uri
            , title: "View listing on the HN site"
        }
        , img({ src: "dist/hn24.jpg"}))
}