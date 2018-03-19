
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

export default class Debug extends Component {
    render(props, state) {
        let rect = { ready: false };
        if (props.bounds) {
            rect = JSON.stringify(props.bounds);
        }

        let selection = (props.selection || '').toString();
        let range = JSON.stringify(props.range || {});

        let annotations = [];
        props.annotations.forEach( a=> {
            annotations.push( (<li>{a.quote}</li>) )
            annotations.push( (<li>{a.range}</li>) )
        });

        return <div>
        <h2>Debug</h2>
            <ul>
            <li><label>Focus:</label> { props.focus }</li>
            <li><label>Selection:</label> { selection }</li>
            <li><label>Range:</label> { range }</li>
            <li><label>Bounds:</label> { rect }</li>
            </ul>
            <ul>
            { annotations }
            </ul>
        </div>;
    }
}
