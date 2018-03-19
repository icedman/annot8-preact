
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

export default class UI extends Component {

    onAction(action, btn) {
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

            buttons.push(
            (<button class='annot8-toolbar-button'
                data-tag={btn.tag}
                onClick={e => this.onAction(btn.action, btn) }>
            <span class='annot8-toolbar-icon'>{btn.title}</span>
            </button>)
            )
        });

        return <div class="annot8-ui">
        <div class="annot8-toolbar-inner">
        {buttons}
        </div>
        </div>
    }
}
