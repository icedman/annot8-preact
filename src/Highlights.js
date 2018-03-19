
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

/*
<!-- HTML5 based renderer -->
<div class="annot8-canvas annot8-disableSelection annot8-canvas-html"
    style="display:block;position: absolute; top:0px; left:0px"
    :style="getStyleRect">
  <div class="annot8-hl"
    :class="[ getHighlightClass(h) ]"
    v-for="(h, index) in highlights"
    style='position:absolute;display:block'
    :style="[ {'top': h.y + 'px' }, {'left': h.x + 'px' }, {'width': h.width + 'px' } , {'height': h.height + 'px' }]"
    :data-idx="h.idx">
  </div>
</div>
*/

class Highlight extends Component {
    render(props, state) {
        let r = props.rect;
        if (r == undefined) {
            return h();
        }
        let opacity = props.focused ? 0.9 : 0.4;
        let style = {
            position: 'absolute',
            display: 'block',
            top: r.y + 'px',
            left: r.x + 'px',
            width: r.width + 'px',
            height: r.height + 'px',
            backgroundColor: 'red',
            opacity: opacity
        };
        return <div class='annot8-hl' data-idx={r.idx} style={style}></div>
    }
}

export default class Highlights extends Component {
    render(props, state) {
        let offset = props.offset || { x: 0, y: 0 };
        let style = {
            zIndex: -1,
            position: 'absolute',
            display: 'block',
            top: (props.canvas.top + offset.y) + 'px',
            left: (props.canvas.left + offset.x) + 'px',
            width: '40px', height: '40px'
        };
        let highlights = [];
        (props.highlights || []).forEach(highlight => {
            highlights.push( (<Highlight focused={highlight.idx==props.focus} rect={highlight}></Highlight>) )
        });
        return <div class='annot8-canvas' style={ style }>
        { highlights }
        </div>;
    }
}
