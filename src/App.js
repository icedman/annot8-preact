import { h, render, Component } from 'preact';
import EventSpy from './EventSpy.js';
import { _ } from './libs.js';
import { toRange, fromRange } from 'xpath-range';

import Debug from './Debug.js';
import Highlights from './Highlights.js';

export default class App extends Component {

    constructor() {
        super();
        
        this.$root = null;
        this.$el = null;

        this.state = {
            annotations: [],
            highlights: [],
            selection: null,
            range: null,
            selectionBounds: { rect: {}, ready: false },
            canvas: {},
            offset: null,
            root: null,

            // ui
            focus: null,
            lastFocus: null
        };

        this.methods();
    }

    componentDidMount() {
        this.init();
    }

    componentWillUnmount() {
        EventSpy.stop();
    }

    init() {
        // run!
        window.Annot8 = this;

        this.$root = document.body;
        for(var sel of this.$config.selector) {
            var elm = document.querySelector(sel);
            if (elm) {
              this.$root = elm;
              break;
            }
        }
        this.$el = document.querySelector('#annot8AppElement');

        try {
            this.$root.appendChild(this.$el);
        } catch(e) {
        }

        EventSpy.start(this.$root,
            /* selection callback */
            (sel, range) => {
                this.setState( { selectionBounds: { ready: false } } );
                this.onSelectionChanged(sel, range);
            },
            /* resize callback */
            () => {
                this.onDocumentResized();
            },
            /* mouse callback */
            (pos) => {
                console.log(pos);
                  // this.log(pos);
                this.setState( { selectionBounds: { ready: false } } );
                this.onMouseUp(pos);
            },
            /* key callback */
            (keycode) => {
                console.log(keycode);
              if (keycode == 27) {
                
                // cancel everything (immediately)
                // this.currentToolbar = '';
                // this.focus = null;
                // this.lastFocus = null;

                this.clearSelection();
                this.setState({ lastFocus: null }); 
              }
            }
        );
    }

    // a little bit declarative
    methods() {
        Object.assign(this,
        {
            onSelectionChanged: _.debounce(function(sel, range) {
                this.setState( { selection : sel } );
                this.setState( { range : range ? fromRange(range, this.$root) : null } );
                this.setState( { selectionBounds: { ready: false } } );
                this.calculateSelectionBounds(range);
                if (range) {
                    this.setState({ focus: null });
                }
            }, 50),

            onDocumentResized: _.debounce(()=>{
                this.setState( { offset: null } );
                this.draw();
                // console.log('on document resized ' + this.time);
            }, 50),

            onMouseUp: _.debounce(function(pos) {
                this.setState({ focus: null });

                var pad = 2;
                // make relative
                pos.x = pos.x - window.scrollX;
                pos.y = pos.y - window.scrollY;
                
                // get hit highlight
                var rects = [];
                var timeoutId;
                document.querySelectorAll('.annot8-hl').forEach( n=> {
                    var h = n.getClientRects()[0];
                    h.x = h.x || h.left;
                    h.y = h.y || h.top;
                    var left = h.x - pad;
                    var right = h.x + h.width + pad;
                    var top = h.y - pad;
                    var bottom = h.y + h.height + pad;

                    if (left < pos.x && right > pos.x &&
                        top < pos.y && bottom > pos.y) {
                        this.setState({ focus: parseInt(n.dataset.idx) });
                        this.setState({ lastFocus: this.state.focus });
                        rects.push({x:pos.x, y:h.y, width:2, height:h.bottom-h.top});
                    }

                    if (this.state.focus >=0) {
                        if (timeoutId != null) {
                            clearTimeout(timeoutId);
                        }
                        let timeoutId = setTimeout(() => {
                            let rect = this.calculateBoundsFromRects(rects);
                            rect.ready = true;
                            this.setState( { selectionBounds: rect });
                        }, 50);
                    }
                });
            }, 50),

            _createAnnotation(params) {
                let annotation = {
                  quote: this.state.selection.toString(),
                  range: JSON.stringify(this.state.range),
                  rects: [],
                  // tag: this.tag
                };
                this.setState({ annotations: [ ...this.state.annotations, annotation ]})
            },

            _updateAnnotation(params) {

            },

            annotate(params) {
              // params = params || {};
              // this.tag = params.tag || '';

              if (this.state.selection) {
                this._createAnnotation(params);
              } else if (params.id != undefined) {
                this._updateAnnotation(params);
              }

              this.draw();
              this.clearSelection();
              // this.currentToolbar = '';
            },

            comment(params) {
                params.id = this.focus;
                this._updateAnnotation(params);
            },

            erase(idx) {
                try {
                    let annotations = [ ...this.state.annotations ];
                    annotations.splice(idx,1);
                    this.setState({ annotations: annotations });
                    this.draw();
                    this.clearSelection();
                    this.setState({ lastFocus: null }); 

                    // this.onDelete(annotation);
                } catch(e) {
                    console.log(e);
                    // why?
                }
            },

            clearSelection() {
              if (window.getSelection) {
                  if (window.getSelection().empty) {  // Chrome
                      window.getSelection().empty();
                  } else if (window.getSelection().removeAllRanges) {  // Firefox
                      window.getSelection().removeAllRanges();
                  }
              } else if (document.selection) {  // IE?
                  document.selection.empty();
              }

              this.setState( { selection: null });
              this.setState( { range: null });
              this.setState( { focus: null });
            },

            calculateSelectionBounds: _.debounce(function(range) {
              if (range == null)
                return;

              // if (this.$config.mobile) {
              //   this.selectionBounds.ready = true;
              //   return;
              // }

              try {
                let rect = this.calculateBoundsFromRects(range.getClientRects());
                rect.ready = true;
                this.setState( { selectionBounds: rect } );
                console.log(this.selectionBounds);
              } catch(e) {
                // this.log(e);
                console.log(e);
              }
            }, 450),

            calculateBoundsFromRects: function(rects) {
              let rect = {};

              for(let clientRect of rects) {
                let x = clientRect.x || clientRect.left;
                let y = clientRect.y || clientRect.top;
                let x2 = x + (clientRect.width || 0);
                let y2 = y + (clientRect.height || 0);

                if (rect.x > x || !rect.x) {
                  rect.x = x;
                }
                if (rect.y > y || !rect.y) {
                  rect.y = y;
                }
                if (rect.x2 < x2 || !rect.x2) {
                  rect.x2 = x2;
                }
                if (rect.y2 < y2 || !rect.y2) {
                  rect.y2 = y2;
                }
              }

              rect.width = rect.x2 - rect.x;
              rect.height = rect.y2 - rect.y;
              rect.ready = true;

              rect.x = rect.x + window.scrollX;
              rect.y = rect.y + window.scrollY;
              return rect;
            },

            setZIndices() {
              let elm = this.$root;
              let z = 1;
              while(elm && elm !== document.body) {
                if (!elm.style.zIndex) {
                  elm.style.zIndex = z++;
                }
                elm = elm.parentElement;
              }
            },

            accountForOffsets: _.debounce(function() {
              let canvas = document.querySelector('.annot8-canvas');
              let canvasRect = canvas.getBoundingClientRect();
              let rootRect = this.$root.getBoundingClientRect();
              this.setState({ offset: { x: rootRect.left - canvasRect.left,y: rootRect.top - canvasRect.top } })
            }, 250),

            draw() {
                // TODO re-renders each time!
                this.state.annotations.forEach(a=> { this.drawAnnotation(a) });

                // first, position the canvas
                let canvasRect = this.$root.getBoundingClientRect();
                let canvas = {};
                canvas.top = this.$root.offsetTop;
                canvas.left = this.$root.offsetLeft;
                canvas.width = canvasRect.width;
                canvas.height = canvasRect.height;

                if (this.state.offset == null) {
                    this.accountForOffsets();
                }

                this.setState( { canvas: canvas });

                let rects = [];
                let idx = 0;
                this.state.annotations.forEach(a=> {
                    a.rects.forEach(r=> {
                        if (!r) return; // why would this happen?
                        rects.push({
                            x: r.x - 2,
                            y: r.y - 2,
                            width: r.width,
                            height: r.height,
                            idx: idx,
                            tag: a.tag,
                        });
                    });
                    // cleanup so rects doesn't get saved
                    a.rects = null;
                    idx++;
                });

                this.setState({ highlights: rects });

                this.setZIndices();
            },

            drawAnnotation(annotation) {
              annotation.rects = [];

              let obj = JSON.parse(annotation.range)
              let range = null;
              try {
                range = toRange(obj.start, obj.startOffset, obj.end, obj.endOffset, this.$root);
              } catch(e) {
                // document modified?
                // mark for removal?
                return;
              }

              let bound = this.$root.getBoundingClientRect();

              // use X,Y
              bound.x = bound.x || bound.left;
              bound.y = bound.y || bound.top;

              let rects = range.getClientRects();
              for(let i=0;i<rects.length;i++) {
                let rect = rects.item(i);

                // use X,Y
                rect.x = rect.x || rect.left;
                rect.y = rect.y || rect.top;

                // make relative
                rect.y = rect.y - bound.y;
                rect.x = rect.x - bound.x;
                annotation.rects.push(rect);
              }
            },
        });
    }

    render(props, state) {
        return <div id="annot8AppElement">
            <Debug
                focus={ state.focus }
                selection={ state.selection }
                range={ state.range }
                bounds={ state.selectionBounds }
                annotations={ state.annotations }
            ></Debug>
            { state.selection ? (<button onClick={ e => this.annotate({}) }>Annotate</button>) : null }
            { state.focus!= null ? (<button onClick={ e => this.erase(state.focus) }>Erase</button>) : null }
            <Highlights focus={ state.focus } offset={ state.offset } canvas={ state.canvas } highlights={ state.highlights }></Highlights>
        </div>;
    }
}