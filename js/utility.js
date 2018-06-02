goog.require('Matrix.Cells')
goog.require('Matrix.Model')
goog.require('Matrix.mxWeb')
goog.provide('Hiring.utility')

function toggleChar ( name, title, initialState, onChar, offChar, attrs={}, locals={},style="") {
    return span( Object.assign( {
            style: "font-weight:bold; cursor:pointer; margin-left:9px; font-family:Arial; font-size:1em;"+style
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


function openShutCase( name, title, initOpen, echo, ...cases) {
    let toggleName = name+"-toggle";
    return div(
        div({class: "selector"}
            , span( title)
            , toggleChar( toggleName, "Show/hide "+title, initOpen, "&#x25be", "&#x25b8")
            , echo)
        , div( { class: cF( c=> "osBody " + slideInRule(c, c.md.fmUp(toggleName).onOff))
                , style: cF( c=> "background:#ff6600;display:" + (c.md.fmUp(toggleName).onOff? "block":"none"))}
            , cases.map( c=> c())))
}

function openCase( name, title, ...cases) {
    let toggleName = name+"-toggle";
    return div(
            span( {
                style: "margin-left:24px;min-width:48px"
            }, title)
        , cases.map( c=> c()))
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

const hzFlexWrapCentered = {
    display: "flex"
    , flex_wrap: "wrap"
    , align_items: "center"
}

const hzFlexWrapBottom = {
    display: "flex"
    , flex_wrap: "wrap"
    , align_items: "bottom"
}

function helpToggle ( name, title, attrs={}) {
    return b( merge({
            style: "color:white; cursor:pointer; margin-left:9px;"
            , onclick: mx=> mx.onOff = !mx.onOff
            , title: title
            , content: cF(c => c.md.onOff ? "hide" : "help")
        }, attrs)
        , { name: name
            , onOff: cI( false)})
}

function viewOnHN ( uri, attrs={}) {
    return a( merge({
            href: uri
            , title: "View on the HN site"
        }, attrs)
        , img({ src: "dist/hn24.png"}))
}


function myRange( start, end) {
    if (start === undefined) {
        return []
    } else if ( end === undefined) {
        return myRange( 0, start)
    } else {
        let r = []
        for (n = start; n < end; ++n) {
            r.push(n)
        }
        return r
    }
}

function merge(...maps) {
    return Object.assign({}, ...maps)
}

