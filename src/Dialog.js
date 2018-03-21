
import { h, render, Component } from 'preact';
import { _ } from './libs.js';

export default class Dialog extends Component {

    constructor() {
        super();
        this.state = {
            edit: false,
            author: '',
            created: '',
            comment: ''
        }
    }

    componentDidMount() {
        let annotation = this.$api.annotation();
        this.setState({
            author: annotation.author || '',
            comment: annotation.comment || '',
            created: annotation.created || ''
        });
    }

    save() {
        let comment = document.querySelector('.annot8-modal-inner textarea').value;
        let annotation = this.$api.annotation();
        this.$api.comment({id:annotation.id, comment:comment});
        this.$api.clear();
    }

    edit() {
        this.props.ui.draw();
        this.setState({edit:true});
    }

    render(props, state) {

        let modalClass = 'annot8-modal-body ' + (state.edit ? 'annot8-edit-mode' : '');
        return (
        <div class="annot8-modal-inner">
          <div class={modalClass}>{ state.edit ? (<textarea class="annot8-textarea" rows="4"
                style="min-width:288px;max-width:288px">{ state.comment }</textarea>) : 
                (<div class="annot8-modal-text">{ state.comment }</div>)
            }
            <div>

            { !state.edit && props.canEdit ? <button onClick={e=>this.edit()} class="annot8-modal-button" style="float:right;">
            <svg viewBox="0 0 1515 1515" witdh="12" height="12"><path d="M363 1387l91-91-235-235-91 91v107h128v128h107zm523-928q0-22-22-22-10 0-17 7L305 986q-7 7-7 17 0 22 22 22 10 0 17-7l542-542q7-7 7-17zm-54-192l416 416-832 832H0v-416zm683 96q0 53-37 90l-166 166-416-416 166-165q36-38 90-38 53 0 91 38l235 234q37 39 37 91z"/></svg>
            </button>: '' }
            { state.edit  && props.canEdit ? <button onClick={e=>this.save()} class="annot8-modal-button" style="float:right;">
            <svg viewBox="0 0 1550 1188" witdh="12" height="12"><path d="M1550 232q0 40-28 68l-724 724-136 136q-28 28-68 28t-68-28l-136-136L28 662Q0 634 0 594t28-68l136-136q28-28 68-28t68 28l294 295 656-657q28-28 68-28t68 28l136 136q28 28 28 68z"/></svg>
            </button> : ''}

            <div style="float:right; line-height:14px; padding:8px; padding-right:0px">
            <span class="author">{ state.author }</span>&nbsp;
            <span class="created">{ state.created }</span>
            </div>

            </div>

          </div>
        </div>
        );

    }
}
