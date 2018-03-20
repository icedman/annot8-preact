
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

export default class UI extends Component {

    constructor() {
        super();

        this.state = {
            ui: '',
            toolbarSize: {ready:false}
        };

        this.methods();
    }

    methods() {
        Object.assign(this, {
            draw: _.debounce(function() {
                let toolbarElement = document.querySelector('.annot8-toolbar-inner');
                if (toolbarElement && toolbarElement.offsetWidth) {
                    let size = { 
                        height: toolbarElement.offsetHeight + 4,
                        width: toolbarElement.offsetWidth,
                        ready: true
                    };
                    this.setState({toolbarSize:size});
                }
            }, 150),
        });
    }

    onAction(action, btn) {
        // this.$api.debug.log(action);

        if (typeof(action) == 'function') {
            action(this.$api.annotation);
            return;
        }

        let tag = btn.tag || '';
        let id = null;
        if (this.$api.annotation()) {
            id = this.$api.annotation().idx;
        }
        
        switch(action) {
        case 'annotate':
            this.$api.annotate({id:id, tag:tag});
            break;
        case 'tags':
            this.$api.menu('tags');
            break;
        case 'erase':
            this.$api.erase(this.$api.annotation.idx);
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

        let containerStyle = {
            position: 'fixed',
            bottom: '10px'
        }

        let top = 0;
        let left = 0;
        if (!this.$config.mobile && bounds.ready) {

            containerStyle = { position: 'absolute', top: '0px', left: '0px' };
            
            left = bounds.x + (bounds.width/2) - (this.state.toolbarSize.width/2);
            top = bounds.y - this.state.toolbarSize.height;

            // force within screen
            let sw = window.screen.availWidth * 0.85;
            let sy = window.scrollY;
            let tw = this.state.toolbarSize.width * 1.25;
            if (left + tw >= sw) {
                left = sw - tw;
            } else if (left < 40) {
                left = 40;
            }
            if (top - sy < 0) {
                top = bounds.y + bounds.height + 10;
            }
        }

        Object.assign(containerStyle, {
            zIndex: 999,
            opacity: (bounds.ready && this.state.toolbarSize.ready) ? 1 : 0
        });

        let toolbarStyle = {
            position: 'absolute',
            top: top + 'px',
            left: left + 'px'
        }

        // let ts = JSON.stringify(toolbarStyle);

        let uiState = ui + buttons.length;
        if (uiState != this.state.ui && bounds.ready) {
            this.setState({ui:uiState, toolbarSize: {ready:false}});
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
