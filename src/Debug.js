
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

export default class Debug extends Component {

    constructor() {
        super();
        this.state = {
            variables: {},
            logs: []
        }

        Object.assign(this.$api,{ 
            debug: {
                log: (msg)=> this.log(msg)
            }
        });
    }

    log(msg) {
        if (!this.$config.debug)
            return;

        console.log(msg);

        let logs = [...this.state.logs];
        logs.push(msg);
        this.setState({logs:logs});
    }

    render(props, state) {
        if (!this.$config.debug)
            return h();
        
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

        let logs = [];
        this.state.logs.forEach( a=> {
            logs.push( (<li>Error: {a}</li>) )
        });

        return <div class="annot8-ui">
        <h2>Debug</h2>
            <ul>
            <li><label>Menu:</label> { props.menu }</li>
            <li><label>Focus:</label> { props.focus }</li>
            <li><label>Selection:</label> { selection }</li>
            <li><label>Range:</label> { range }</li>
            <li><label>Bounds:</label> { rect }</li>
            </ul>
            <ul>
            { annotations }
            { logs }
            </ul>
        </div>;
    }
}
