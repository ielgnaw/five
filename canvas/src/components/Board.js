/**
 * @file 棋盘组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';

import store from '../common/store';

import './Board.styl';

const subscribe = board => {
    store.subscribe(() => {
        const state = store.getState();
        board.setState({
            piecePool: state.data.piecePool,
            track: state.data.track,
            type: state.data.type,
            isConsecutiveUndo: state.data.isConsecutiveUndo
        });
    });
};

const NUM = 15;

const resetPiecePool = () => {
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
};

export default class Board extends Component {

    constructor(props) {
        super(props);
        this.drawBoard = this.drawBoard.bind(this);
        this.drawPiece = this.drawPiece.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.calculate = this.calculate.bind(this);
        this.checkArray = this.checkArray.bind(this);
        this.checkVertical = this.checkVertical.bind(this);
        this.checkHorizontal = this.checkHorizontal.bind(this);
        this.checkDiagonalArr135 = this.checkDiagonalArr135.bind(this);
        this.checkDiagonalArr45 = this.checkDiagonalArr45.bind(this);
        this.reset = this.reset.bind(this);
    }

    state = {
        // 当前归谁下，默认开始的时候黑方先下
        type: 'black',
        containerOffsetLeft: 0,
        containerOffsetTop: 0,
        gridWidth: 30,
        // 落子的池子
        piecePool: resetPiecePool(),
        // 追踪
        track: {
            white: [],
            black: []
        },
        ctx: null,
        num: NUM
    }

    componentWillMount() {
        subscribe(this);
    }

    componentDidMount() {
        this.setState({
            canvas: this.container,
            ctx: this.container.getContext('2d')
        }, () => {
            this.drawBoard();

            this.setState({
                containerOffsetLeft: this.container.offsetLeft,
                containerOffsetTop: this.container.offsetTop
            });

            const {type, piecePool, track, canvas, ctx, gridWidth} = this.state;

            store.dispatch({
                type: 'toggleType',
                data: {
                    type: type,
                    piecePool: piecePool,
                    track: track,
                    canvas: canvas,
                    ctx: ctx,
                    gridWidth: 30
                }
            });
        });
    }

    reset(x, y) {
        const {canvas, ctx, gridWidth, track} = this.state;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 把最后那一步的落子的圆形边框去掉
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(-gridWidth, -gridWidth, gridWidth / 2 - 1, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();

        this.drawBoard();

        this.setState({
            type: 'black',
            // 落子的池子
            piecePool: resetPiecePool(),
            // 追踪
            track: {
                white: [],
                black: []
            },
        });

        store.dispatch({
            type: 'toggleType',
            data: {
                type: 'black',
                piecePool: resetPiecePool(),
                track: track,
                canvas: canvas,
                ctx: ctx,
                gridWidth: 30
            }
        });
    }

    /**
     * 画棋盘
     */
    drawBoard() {
        const {num, gridWidth, ctx} = this.state;

        ctx.save();
        ctx.strokeStyle = '#ddd';

        ctx.lineWidth = 1.5;
        for (let i = 0; i <= num; i++) {
            // 横线
            ctx.moveTo(0, (num + num) * i);
            ctx.lineTo(num * gridWidth + num, (num + num) * i);

            // 竖线
            ctx.moveTo((num + num) * i, 0);
            ctx.lineTo((num + num) * i, num * gridWidth + num);
        }

        ctx.stroke();
        ctx.restore();
    }

    /**
     * 画棋子
     */
    drawPiece(i, j) {
        const {num, gridWidth, ctx, type} = this.state;

        ctx.save();
        ctx.beginPath();
        ctx.arc(num + i * gridWidth, num + j * gridWidth, gridWidth / 2 - 2, 0, 2 * Math.PI);
        ctx.closePath();

        const gradient = ctx.createRadialGradient(
            num + i * gridWidth,
            num + j * gridWidth,
            gridWidth / 2 - 2,
            num + i * gridWidth,
            num + j * gridWidth,
            0
        );

        if (type === 'black') {
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

        this.calculate(i, j);
    }

    /**
     * 判断数组中连续出现相同的值是否大于等于五次
     */
    checkArray(val, arr) {
        return arr.reduce((previous, current) => {
            return current.piece == val ? previous + 1 : (previous < 5 ? 0 : previous)
        }, 0) >= 5;
    }

    /**
     * 检测垂直是否连成五个
     */
    checkVertical(i, j) {
        const {piecePool, type} = this.state;
        const verticalArr = piecePool[i];
        return this.checkArray(type, verticalArr);
    }

    /**
     * 检测水平是否连成五个
     */
    checkHorizontal(i, j) {
        const {piecePool, type, num} = this.state;

        const horizontalArr = [];
        for (let indexForHorizontalArr = 0; indexForHorizontalArr < num; indexForHorizontalArr++) {
            horizontalArr.push(piecePool[indexForHorizontalArr][j]);
        }

        return this.checkArray(type, horizontalArr);
    }

    /**
     * 检测 135° 那条斜线上是否连成五个
     */
    checkDiagonalArr135(i, j) {
        const {piecePool, type, num} = this.state;

        // 135° 斜线那一列的数组
        const diagonalArr135 = [];

        // startX 是当前落子的单元格 135° 斜线最左上的那个单元格的 x 坐标
        const startX = (i - j <= 0) ? 0 : i - j;
        // endX 是当前落子的单元格 135° 斜线最右下的那个单元格的 x 坐标
        const endX = (num - 1 - j + i >= (num - 1)) ? (num - 1) : num - 1 - j + i;

        // < 4 说明 135° 这条线不足五颗棋子
        if (endX - startX < 4) {
            return false;
        }
        // startY 是当前落子的单元格 135° 斜线最左上的那个单元格的 y 坐标
        let startY = 0;
        let endY = 0;
        if (i - j < 0) {
            startY = j - i;
            endY = num - 1;
        }
        else {
            endY = num - 1 - (i - j);
        }

        for (
            let indexXForDiagonalArr135 = startX, indexYForDiagonalArr135 = startY;
            indexXForDiagonalArr135 <= endX, indexYForDiagonalArr135 <= endY;
            indexXForDiagonalArr135++, indexYForDiagonalArr135++
        ) {
            diagonalArr135.push(piecePool[indexXForDiagonalArr135][indexYForDiagonalArr135]);
        }

        return this.checkArray(type, diagonalArr135);
    }

    /**
     * 检测 45° 那条斜线上是否连成五个
     */
    checkDiagonalArr45(i, j) {
        const {piecePool, type, num} = this.state;

        // 45° 斜线那一列的数组
        const diagonalArr45 = [];

        // endX 是当前落子的单元格 45° 斜线最右上的那个单元格的 x 坐标
        const endX = (i + j >= (num - 1)) ? (num - 1) : i + j;
        // startX 是当前落子的单元格 45° 斜线最左下的那个单元格的 x 坐标
        const startX = (i + j >= (num - 1)) ? (i + j - (num - 1)) : 0;

        // < 4 说明 45° 这条线不足五颗棋子
        if (endX - startX < 4) {
            return false;
        }

        const startY = endX;
        const endY = startX;

        for (
            let indexXForDiagonalArr45 = startX, indexYForDiagonalArr45 = startY;
            indexXForDiagonalArr45 <= endX, indexYForDiagonalArr45 >= endY;
            indexXForDiagonalArr45++, indexYForDiagonalArr45--
        ) {
            diagonalArr45.push(piecePool[indexXForDiagonalArr45][indexYForDiagonalArr45]);
        }

        return this.checkArray(type, diagonalArr45);
    }

    calculate(i, j) {
        const {piecePool, type} = this.state;

        if (this.checkVertical(i, j)) {
            setTimeout(() => {
                alert(`垂直方向连成五子，${type === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset(i, j);
            }, 100);
            return;
        }

        if (this.checkHorizontal(i, j)) {
            setTimeout(() => {
                alert(`水平方向连成五子，${type === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
            }, 100);
            return;
        }

        if (this.checkDiagonalArr135(i, j)) {
            setTimeout(() => {
                alert(`135°方向连成五子，${type === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
            }, 100);
            return;
        }

        if (this.checkDiagonalArr45(i, j)) {
            setTimeout(() => {
                alert(`45°方向连成五子，${type === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
            }, 100);
            return;
        }
    }

    handleClick(e) {
        const {containerOffsetLeft, containerOffsetTop, gridWidth, piecePool, type, track, canvas, ctx} = this.state;
        const left = e.clientX - containerOffsetLeft;
        const top = e.clientY - containerOffsetTop;

        const x = Math.floor(left / gridWidth);
        const y = Math.floor(top / gridWidth);

        // 说明当前位置已经有落子
        if (piecePool[x][y].piece) {
            return;
        }

        piecePool[x][y].piece = type;

        const nextType = type === 'black' ? 'white' : 'black';

        track[type].push({
            x: x,
            y: y
        });

        this.setState({
            piecePool: piecePool,
            type: nextType,
        //     track: track
        });

        store.dispatch({
            type: 'toggleType',
            data: {
                type: nextType,
                piecePool: piecePool,
                track: track,
                canvas: canvas,
                ctx: ctx,
                gridWidth: 30,
                isConsecutiveUndo: false
            }
        });

        this.drawPiece(x, y);
    }

    render() {
        return (
            <canvas className="board" width="451px" height="451px"
                ref={ref => this.container = ref} onClick={this.handleClick}
            >
                请使用支持 canvas 的浏览器~
            </canvas>
        );
    }
}
