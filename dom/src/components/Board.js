/**
 * @file 棋盘组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';

import './Board.styl';

// 每行以及每列的单元格数目，正方形
const NUM = 15;

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
        curType: this.props.type,
        containerOffsetLeft: 0,
        containerOffsetTop: 0,
        gridWidth: 30,
        // 落子的池子
        piecePool: (() => {
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
        })(),
        // 追踪
        track: {
            white: [],
            black: []
        }
    }

    componentDidMount() {
        this.drawBoard();

        this.setState({
            containerOffsetLeft: this.container.offsetLeft,
            containerOffsetTop: this.container.offsetTop
        });
    }

    reset() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        this.drawBoard();
        this.setState({
            track: {
                white: [],
                black: []
            },
            piecePool: (() => {
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
            })(),
            curType: this.props.type
        }, () => {
            console.log(this.state);
        });
    }

    /**
     * 画棋盘
     */
    drawBoard() {
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= NUM * NUM; i++) {
            const div = document.createElement('div');
            if (i === 1) {
                div.className = 'grid lt';
            }
            else if (i === NUM) {
                div.className = 'grid rt';
            }
            else if (i === NUM * NUM) {
                div.className = 'grid rb';
            }
            else if (i <= NUM) {
                div.className = 'grid t';
            }
            else if (i > (NUM - 1) * NUM && i <= NUM * NUM) {
                div.className = 'grid b';
                if ((i - 1) % NUM === 0) {
                    div.className = 'grid lb';
                }
            }
            else if ((i - 1) % NUM === 0) {
                div.className = 'grid l';
            }
            else if (i % NUM === 0) {
                div.className = 'grid r';
            }
            else {
                div.className = 'grid';
            }
            // div.innerHTML = (i - 1) % 15 + ',' + Math.floor((i - 1) / 15) ;
            fragment.appendChild(div);
        }
        this.container.appendChild(fragment);
    }

    /**
     * 画棋子
     */
    drawPiece(i, j) {
        const {curType} = this.state;
        const curPiece = document.createElement('div');

        curPiece.className = curType;
        curPiece.style.left = NUM + i * NUM * 2 + 'px';
        curPiece.style.top = NUM + j * NUM * 2 + 'px';

        curPiece.setAttribute('i', i);
        curPiece.setAttribute('j', j);
        curPiece.setAttribute('cur-type', curType);

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
        const {piecePool, curType} = this.state;
        const verticalArr = piecePool[i];
        return this.checkArray(curType, verticalArr);
    }

    /**
     * 检测水平是否连成五个
     */
    checkHorizontal(i, j) {
        const {piecePool, curType} = this.state;

        const horizontalArr = [];
        for (let indexForHorizontalArr = 0; indexForHorizontalArr < NUM; indexForHorizontalArr++) {
            horizontalArr.push(piecePool[indexForHorizontalArr][j]);
        }

        return this.checkArray(curType, horizontalArr);
    }

    /**
     * 检测 135° 那条斜线上是否连成五个
     */
    checkDiagonalArr135(i, j) {
        const {piecePool, curType} = this.state;

        // 135° 斜线那一列的数组
        const diagonalArr135 = [];

        // startX 是当前落子的单元格 135° 斜线最左上的那个单元格的 x 坐标
        const startX = (i - j <= 0) ? 0 : i - j;
        // endX 是当前落子的单元格 135° 斜线最右下的那个单元格的 x 坐标
        const endX = (NUM - 1 - j + i >= (NUM - 1)) ? (NUM - 1) : NUM - 1 - j + i;

        // < 4 说明 135° 这条线不足五颗棋子
        if (endX - startX < 4) {
            return false;
        }
        // startY 是当前落子的单元格 135° 斜线最左上的那个单元格的 y 坐标
        let startY = 0;
        let endY = 0;
        if (i - j < 0) {
            startY = j - i;
            endY = NUM - 1;
        }
        else {
            endY = NUM - 1 - (i - j);
        }

        for (
            let indexXForDiagonalArr135 = startX, indexYForDiagonalArr135 = startY;
            indexXForDiagonalArr135 <= endX, indexYForDiagonalArr135 <= endY;
            indexXForDiagonalArr135++, indexYForDiagonalArr135++
        ) {
            diagonalArr135.push(piecePool[indexXForDiagonalArr135][indexYForDiagonalArr135]);
        }

        return this.checkArray(curType, diagonalArr135);
    }

    /**
     * 检测 45° 那条斜线上是否连成五个
     */
    checkDiagonalArr45(i, j) {
        const {piecePool, curType} = this.state;

        // 45° 斜线那一列的数组
        const diagonalArr45 = [];

        // endX 是当前落子的单元格 45° 斜线最右上的那个单元格的 x 坐标
        const endX = (i + j >= (NUM - 1)) ? (NUM - 1) : i + j;
        // startX 是当前落子的单元格 45° 斜线最左下的那个单元格的 x 坐标
        const startX = (i + j >= (NUM - 1)) ? (i + j - (NUM - 1)) : 0;

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

        return this.checkArray(curType, diagonalArr45);
    }

    calculate(i, j) {
        console.log(i, j);
        const {piecePool, curType} = this.state;
        // i 为列

        if (this.checkVertical(i, j)) {
            setTimeout(() => {
                alert(`垂直方向连成五子，${curType === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
            }, 100);
            return;
        }

        if (this.checkHorizontal(i, j)) {
            setTimeout(() => {
                alert(`水平方向连成五子，${curType === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
            }, 100);
            return;
        }

        if (this.checkDiagonalArr135(i, j)) {
            setTimeout(() => {
                alert(`135°方向连成五子，${curType === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
            }, 100);
            return;
        }

        if (this.checkDiagonalArr45(i, j)) {
            setTimeout(() => {
                alert(`45°方向连成五子，${curType === 'black' ? '黑方' : '白方'}胜利!`);
                this.reset();
            }, 100);
            return;
        }

        console.log(this.state.track.black);
    }

    handleClick(e) {
        const {containerOffsetLeft, containerOffsetTop, gridWidth, piecePool, curType, track} = this.state;
        const left = e.clientX - containerOffsetLeft;
        const top = e.clientY - containerOffsetTop;

        const x = Math.floor(left / gridWidth);
        const y = Math.floor(top / gridWidth);

        // 说明当前位置已经有落子
        if (piecePool[x][y].piece) {
            return;
        }

        piecePool[x][y].piece = curType;

        const nextType = curType === 'black' ? 'white' : 'black';

        track[curType].push({
            x: x,
            y: y
        });

        this.setState({
            piecePool: piecePool,
            curType: nextType,
            track: track
        });

        this.drawPiece(x, y);

        this.props.checkType(nextType);
    }

    render() {
        return (
            <div className="board" ref={ref => this.container = ref} onClick={this.handleClick}>
            </div>
        );
    }
}
