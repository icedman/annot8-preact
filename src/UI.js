
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

export default class UI extends Component {

    constructor() {
        super();

        this.state = {
            ui: '',
            toolbarRect: {ready:false}
        };

        this.methods();
    }

    componentDidMount() {
    }

    methods() {
        Object.assign(this, {
            draw: _.debounce(function() {
                let toolbarElement = document.querySelector('.annot8-toolbar-inner');
                if (toolbarElement && toolbarElement.offsetWidth) {
                    let rect = {
                        offsetX: 0,
                        offsetY: 0,
                        height: toolbarElement.offsetHeight + 4,
                        width: toolbarElement.offsetWidth,
                        ready: false
                    };
                    this.setState({toolbarRect:rect});
                    setTimeout(()=> {
                    let toolbarContainerElement = document.querySelector('.annot8-toolbar-container');
                    let offsetRect = toolbarContainerElement.getBoundingClientRect();
                            let rect = this.state.toolbarRect;
                            rect.ready = true;
                            rect.offsetX = (offsetRect.x || offsetRect.left) + window.scrollX;
                            rect.offsetY = (offsetRect.y || offsetRect.top) + window.scrollY;
                            this.setState({toolbarRect:rect});
                        }, 0)
                }
            }, 50),
        });
    }

    onAction(action, btn) {
        this.$api.debug.log(action);

        if (typeof(action) == 'function') {
            action(this.$api.annotation);
            return;
        }

        let params = {
            tag: btn.tag || '',
        }
        if (this.$api.annotation()) {
            params.id = this.$api.annotation().id;
        }

        this.$api.debug.log(params);

        switch(action) {
        case 'annotate':
            this.$api.annotate(params);
            break;
        case 'tags':
            this.$api.menu('tags');
            break;
        case 'erase':
            this.$api.erase(this.$api.annotation().id);
            break;
        }
    }

    render(props, state) {
        let ui = props.subMenu || 'edit';
        if (props.menu == 'create' && ui != 'tags') {
            ui = 'create';
        }

        let buttons = [];
        (this.$config.buttons || []).forEach(btn=> {
            if (btn.tool != ui) {
                return;
            }

            let icon = this.$api.icons[btn.icon.replace('#','')];
            buttons.push(
            (<button class='annot8-toolbar-button annot8-disableSelection'
                data-tag={btn.tag}
                onClick={e => this.onAction(btn.action, btn) }><span class='annot8-toolbar-icon'>{icon}</span>
            </button>)
            )
        });

        let bounds = this.$api.selectionBounds();        

        let containerStyle = { position: 'absolute', top: '0px', left: '0px' };

        let top = 0;
        let left = 0;
        if (!this.$config.mobile && bounds.ready) {

            containerStyle = { position: 'absolute', top: '0px', left: '0px' };
            
            left = bounds.x + (bounds.width/2) - (this.state.toolbarRect.width/2);
            top = bounds.y - this.state.toolbarRect.height;

            // force within screen
            let sw = window.screen.availWidth * 0.85;
            let sy = window.scrollY;
            let tw = this.state.toolbarRect.width * 1.25;
            if (left + tw >= sw) {
                left = sw - tw;
            } else if (left < 40) {
                left = 40;
            }
            if (top - sy < 0) {
                top = bounds.y + bounds.height + 10;
            }

            left -= this.state.toolbarRect.offsetX;
            top -= this.state.toolbarRect.offsetY;
        }

        let toolbarStyle = {
            // border: '2px solid blue',
            position: 'absolute',
            top: top + 'px',
            left: left + 'px'
        }

        if (this.$config.mobile) {
            containerStyle = { position: 'fixed', left: '0px', bottom: '10px' };
            toolbarStyle = { position: 'relative', top: '0px', left: '0px' };
        }

        Object.assign(containerStyle, {
            zIndex: 999,
            // border: '2px solid red',
            minHeight: '50px',
            opacity: (bounds.ready && this.state.toolbarRect.ready) ? 1 : 0
        });

        let uiState = ui + buttons.length;
        if (uiState != this.state.ui && bounds.ready) {
            this.setState({ui:uiState, toolbarRect: {ready:false}});
            this.draw();
        }

        return <div class="annot8-ui annot8-toolbar-container" style={containerStyle}>
        <div class="annot8-toolbar" style={toolbarStyle}>
        <div class="annot8-toolbar-inner">
        {buttons}
        </div>
        </div>
        </div>
    }
}
