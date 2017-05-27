/**
 * @file 控制组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';
import store from '../common/store';

import './Control.styl';

const subscribe = control => {
    store.subscribe(() => {
        const state = store.getState();

        control.setState({
            type: state.data.type,
            piecePool: state.data.piecePool,
            track: state.data.track,
            canvas: state.data.canvas,
            ctx: state.data.ctx,
            gridWidth: state.data.gridWidth,
            isConsecutiveUndo: state.data.isConsecutiveUndo
        });
    });
};


export default class Control extends Component {
    constructor(props) {
        super(props);

        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
    }

    componentWillMount() {
        subscribe(this);
    }

    state = {
        type: 'black',
        isConsecutiveUndo: false,
        undos: [],
        ctx: null
    }

    undo() {
        const {ctx, type, track, gridWidth, piecePool, isConsecutiveUndo, undos} = this.state;

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

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(
            curUndoObj.x * gridWidth + gridWidth / 2,
            curUndoObj.y * gridWidth + gridWidth / 2,
            gridWidth / 2 - 1,
            0,
            Math.PI * 2,
            true
        );
        ctx.fill();
        ctx.restore();

        piecePool[curUndoObj.x][curUndoObj.y].piece = '';

        this.setState({
            isConsecutiveUndo: true,
            ctx: ctx,
            undos: undos
        });

        store.dispatch({
            type: 'toggleType',
            data: {
                ctx: ctx,
                type: curUndoType,
                piecePool: piecePool,
                track: track,
                gridWidth: gridWidth,
                isConsecutiveUndo: true
            }
        });
    }

    redo() {
        const {undos, track, piecePool, ctx, gridWidth} = this.state;
        const curRedoObj = undos.pop();

        if (!curRedoObj) {
            return;
        }

        track[curRedoObj.piece].push({
            x: curRedoObj.x,
            y: curRedoObj.y
        });

        piecePool[curRedoObj.x][curRedoObj.y].piece = curRedoObj.piece;

        ctx.save();
        ctx.beginPath();
        ctx.arc(15 + curRedoObj.x * gridWidth, 15 + curRedoObj.y * gridWidth, gridWidth / 2 - 2, 0, 2 * Math.PI);
        ctx.closePath();

        const gradient = ctx.createRadialGradient(
            15 + curRedoObj.x * gridWidth,
            15 + curRedoObj.y * gridWidth,
            gridWidth / 2 - 2,
            15 + curRedoObj.x * gridWidth,
            15 + curRedoObj.y * gridWidth,
            0
        );

        if (curRedoObj.piece === 'black') {
            gradient.addColorStop(0, '#0a0a0a');
            gradient.addColorStop(1, '#636766');
        }
        else {
            gradient.addColorStop(0, '#d1d1d1');
            gradient.addColorStop(1, '#f9f9f9');
        }

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();

        this.setState({
            undos: undos,
            isConsecutiveUndo: false
        });

        store.dispatch({
            type: 'toggleType',
            data: {
                ctx: ctx,
                gridWidth: gridWidth,
                type: curRedoObj.piece === 'black' ? 'white' : 'black',
                piecePool: piecePool,
                track: track,
                isConsecutiveUndo: false
            }
        });
    }

    render() {
        return (
            <div className="control">
                <button onClick={this.undo}>悔棋</button>
                <button onClick={this.redo}>撤销悔棋</button>
                <span className="info">
                    {`当前${this.state.type === 'black' ? '黑方' : '白方'}下`}
                </span>
            </div>
        );
    }
}
