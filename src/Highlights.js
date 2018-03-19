
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

class Highlight extends Component {
    render(props, state) {
        let r = props.rect;
        if (r == undefined) {
            return h();
        }
        let opacity = props.focused ? 0.9 : 0.4;
        let cls = [ 'annot8-hl' ];
        if (props.focused)
            cls.push('annot8-active');
        if (r.tag) {
            cls.push(`annot8-hl-${r.tag}`);
        }
        let style = {
            position: 'absolute',
            display: 'block',
            top: r.y + 'px',
            left: r.x + 'px',
            width: r.width + 'px',
            height: r.height + 'px'
        };
        return <div class={cls.join(' ')} data-idx={r.idx} style={style}></div>
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
