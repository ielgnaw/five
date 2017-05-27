/**
 * @file 主入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';
import {render} from 'react-dom';

import Board from './components/Board';
import Control from './components/Control';

import './main.styl';

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="board-wrapper">
                <Control />
                <Board />
            </div>
        );
    }
}

render(
    <Main />,
    document.getElementById('root')
);
