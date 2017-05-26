/**
 * @file 主组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';

import Board from './Board';
import Control from './Control';

import './App.styl';

// 每行以及每列的单元格数目，正方形
const NUM = 15;

export default class App extends Component {
    constructor(props) {
        super(props);

        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.reset = this.reset.bind(this);
        this.createPiecePool = this.createPiecePool.bind(this);
    }

    state = {
        type: 'black',
        // 是否连续 undo
        isConsecutiveUndo: false,
        track: {
            white: [],
            black: []
        },
        undos: []
    }

    componentWillMount() {
        this.setState({
            piecePool: this.createPiecePool()
        });
    }

    reset() {
        this.setState({
            piecePool: this.createPiecePool(),
            type: 'black',
            // 是否连续 undo
            isConsecutiveUndo: false,
            track: {
                white: [],
                black: []
            }
        });
    }

    createPiecePool() {
        const ret = [];
        for (let r = 0; r < NUM; r++) {
            ret[r] = [];
            for (let c = 0; c < NUM; c++) {
                ret[r][c] = {
                    x: r,
                    y: c,
                    piece: ''
                };
            }
        }
        return ret;
    }

    redo() {
        const {undos, track, piecePool} = this.state;
        const curRedoObj = undos.pop();

        if (!curRedoObj) {
            return;
        }

        track[curRedoObj.piece].push({
            x: curRedoObj.x,
            y: curRedoObj.y
        })

        this.setState({
            type: curRedoObj.piece === 'black' ? 'white' : 'black',
            track: track,
            undos: undos,
            isConsecutiveUndo: false
        });

        piecePool[curRedoObj.x][curRedoObj.y].piece = curRedoObj.piece;

        const dom = document.createElement('div');
        dom.className = curRedoObj.piece;
        dom.style.left = NUM + curRedoObj.x * NUM * 2 + 'px';
        dom.style.top = NUM + curRedoObj.y * NUM * 2 + 'px';
        dom.setAttribute('i', curRedoObj.x);
        dom.setAttribute('j', curRedoObj.y);
        dom.setAttribute('cur-type', curRedoObj.piece);
        document.querySelector('.board').appendChild(dom);
    }

    undo() {
        const {type, track, isConsecutiveUndo, piecePool, undos} = this.state;
        if (isConsecutiveUndo) {
            alert('不允许连续悔棋');
            return;
        }
        // 传过来的 type 是下一次的，所以用上一次的 pop
        const curUndoType = isConsecutiveUndo ? type : ((type === 'black') ? 'white' : 'black');
        const curUndoObj = track[curUndoType].pop();

        if (!curUndoObj) {
            return;
        }

        undos.push(Object.assign({}, piecePool[curUndoObj.x][curUndoObj.y]));

        piecePool[curUndoObj.x][curUndoObj.y].piece = '';

        this.setState({
            type: curUndoType,
            track: track,
            undos: undos,
            piecePool: piecePool,
            isConsecutiveUndo: true
        });

        const dom = document.querySelector(`
            div.${curUndoType}[i='${curUndoObj.x}'][j='${curUndoObj.y}'][cur-type="${curUndoType}"]
        `);
        dom.parentNode.removeChild(dom);
    }

    render() {
        const {type, track, isConsecutiveUndo, piecePool} = this.state;
        return (
            <div className="board-wrapper">
                <Control type={type} track={track} undo={this.undo} redo={this.redo}/>
                <Board track={track} type={type} piecePool={piecePool}
                    num={NUM} isConsecutiveUndo={isConsecutiveUndo}
                    reset={this.reset}
                    checkType={(type, isConsecutiveUndo) => {
                        this.setState({
                            type: type,
                            isConsecutiveUndo: isConsecutiveUndo
                        });
                    }}
                />
            </div>
        );
    }
}
