/**
 * @file 棋盘组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';

import './Board.styl';

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
        type: this.props.type,
        num: this.props.num,
        isConsecutiveUndo: this.props.isConsecutiveUndo,
        containerOffsetLeft: 0,
        containerOffsetTop: 0,
        gridWidth: 30,
        // 落子的池子
        piecePool: this.props.piecePool,
        // 追踪
        track: this.props.track
    }

    componentDidMount() {
        this.drawBoard();

        this.setState({
            containerOffsetLeft: this.container.offsetLeft,
            containerOffsetTop: this.container.offsetTop
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            type: nextProps.type
        });
    }

    reset() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.drawBoard();
        this.props.reset();
        this.setState({
            track: this.props.track,
            num: this.props.num,
            isConsecutiveUndo: this.props.isConsecutiveUndo,
            piecePool: this.props.piecePool,
            type: this.props.type
        });
    }

    /**
     * 画棋盘
     */
    drawBoard() {
        const fragment = document.createDocumentFragment();

        const {num} = this.state;

        for (let i = 1; i <= num * num; i++) {
            const div = document.createElement('div');
            if (i === 1) {
                div.className = 'grid lt';
            }
            else if (i === num) {
                div.className = 'grid rt';
            }
            else if (i === num * num) {
                div.className = 'grid rb';
            }
            else if (i <= num) {
                div.className = 'grid t';
            }
            else if (i > (num - 1) * num && i <= num * num) {
                div.className = 'grid b';
                if ((i - 1) % num === 0) {
                    div.className = 'grid lb';
                }
            }
            else if ((i - 1) % num === 0) {
                div.className = 'grid l';
            }
            else if (i % num === 0) {
                div.className = 'grid r';
            }
            else {
                div.className = 'grid';
            }
            div.innerHTML = (i - 1) % 15 + ',' + Math.floor((i - 1) / 15) ;
            fragment.appendChild(div);
        }
        this.container.appendChild(fragment);
    }

    /**
     * 画棋子
     */
    drawPiece(i, j) {
        const {type, track, num} = this.state;
        const curPiece = document.createElement('div');

        curPiece.className = type;
        curPiece.style.left = num + i * num * 2 + 'px';
        curPiece.style.top = num + j * num * 2 + 'px';

        curPiece.setAttribute('i', i);
        curPiece.setAttribute('j', j);
        curPiece.setAttribute('cur-type', type);

        this.container.appendChild(curPiece);

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
        // console.log(i, j);
        const {piecePool, type} = this.state;
        // i 为列

        if (this.checkVertical(i, j)) {
            setTimeout(() => {
                alert(`垂直方向连成五子，${type === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
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
        const {containerOffsetLeft, containerOffsetTop, gridWidth, piecePool, type, track} = this.state;
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
            track: track
        });

        this.drawPiece(x, y);

        this.props.checkType(nextType, false);
    }

    render() {
        return (
            <div className="board" ref={ref => this.container = ref} onClick={this.handleClick}>
            </div>
        );
    }
}
