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

function mobileCheck () {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

function pnow() {
    return performance.now();
}
function plapsed(tag, start) {
    //clg('plapsed '+tag, pnow() - start);
}

// --------- help -------------------------
function helpOff( mx, toggleName, tag='anon') {
    clg('helpoff doing', toggleName, tag)
    mx.fmUp(toggleName).onOff = false
}

function helpList ( helpItems, toggleName) {
    return div( {
            class: cF( c=> "help " + slideInRule(c, c.md.fmUp( toggleName).onOff))
            , style: cF( c=> "display:" + (c.md.fmUp(toggleName).onOff? "block":"none"))
            , onclick: mx => helpOff(mx, toggleName, 'outerdiv')
        }
        ,div({style: "cursor:pointer;text-align: right;margin-right:18px;"
            , onclick: mx => helpOff(mx, toggleName, 'Xchar')}, "X")
        , ul({ style: "list-style:none; margin-left:0"}
            , helpItems.map( e=> li({style: "padding:0px;margin: 0 18px 9px 0;"}, e)))

    )
}

