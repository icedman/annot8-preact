
import { h, render, Component } from 'preact';
import { _ } from './libs.js';
import Dialog from './Dialog.js';

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
                let uiElement = document.querySelector('.annot8-toolbar-inner');
                if (!uiElement || this.props.subMenu == 'comments') {
                    uiElement = document.querySelector('.annot8-modal-container');
                    // todo!!!
                }

                // if toolbar
                if (uiElement && uiElement.offsetWidth) {
                    let rect = {
                        offsetX: 0,
                        offsetY: 0,
                        height: uiElement.offsetHeight + 4,
                        width: uiElement.offsetWidth,
                        ready: false
                    };
                    this.setState({toolbarRect:rect});
                    setTimeout(()=> {
                    let uiContainerElm = document.querySelector('.annot8-toolbar-container');
                    let offsetRect = uiContainerElm.getBoundingClientRect();
                            let rect = this.state.toolbarRect;
                            rect.ready = true;
                            rect.offsetX = (offsetRect.x || offsetRect.left) + window.scrollX;
                            rect.offsetY = (offsetRect.y || offsetRect.top) + window.scrollY;
                            this.setState({toolbarRect:rect});
                        }, 0);
                }
            }, 50),

            redraw() {
                this.setState({toolbarRect: {ready:false}});
                this.draw();
            }
        });
    }

    onAction(action, btn) {
        this.$api.debug.log(action);

        if (typeof(action) == 'function') {
            action(this.$api.annotation);
            return;
        }

        let params = {
            tag: btn.tag || this.$api.tag(),
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
        case 'comment':
            this.$api.menu('comments');
            break;
        case 'erase':
            this.$api.erase(this.$api.annotation().id);
            break;
        }
    }

    render(props, state) {
        let ui = props.subMenu || 'edit';
        if (props.menu == 'create' && ui != 'tags' && ui != 'comments') {
            ui = 'create';
        }

        let buttons = [];
        (this.$config.buttons || []).forEach(btn=> {
            if (btn.tool != ui) {
                return;
            }
            let icon = this.$api.icons[btn.icon.replace('#','')];
            let tag = btn.tag;
            if (!tag && btn.action=='annotate') {
                tag = this.$api.tag();
            }
            buttons.push(
            (<button class='annot8-toolbar-button annot8-disableSelection'
                data-tag={tag}
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
            
            left = bounds.x + (bounds.width/2) - (state.toolbarRect.width/2);
            top = bounds.y - this.state.toolbarRect.height;

            // force within screen
            let sw = window.screen.availWidth * 0.85;
            let sy = window.scrollY;
            let tw = state.toolbarRect.width * 1.25;
            if (left + tw >= sw) {
                left = sw - tw;
            } else if (left < 40) {
                left = 40;
            }
            if (top - sy < 0) {
                top = bounds.y + bounds.height + 10;
            }

            left -= state.toolbarRect.offsetX;
            top -= state.toolbarRect.offsetY;
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
            transition: (bounds.ready && state.toolbarRect.ready) ? 'opacity 250ms' : '',
            opacity: (bounds.ready && state.toolbarRect.ready) ? 1 : 0
        });

        let showComments = (ui == 'comments');
        let uiState = ui + buttons.length + (showComments ? 1 : 0);
        if (uiState != state.ui && bounds.ready) {
            this.setState({ui:uiState});
            this.redraw();
        }

        let commands = {
            draw: ()=>{this.redraw()}
        };

        return <div class="annot8-toolbar-container" style={containerStyle}>
        <div class="annot8-toolbar" style={toolbarStyle}>
        <div class="annot8-ui annot8-toolbar-inner">
        {buttons}
        </div>

        <div class="annot8-ui annot8-modal-container">
        {showComments?<Dialog ui={commands} edit={false} canEdit={true}></Dialog>:''}
        </div>

        </div>
        </div>
    }
}
