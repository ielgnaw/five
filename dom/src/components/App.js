/**
 * @file 主组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';

import Board from './Board';
import Control from './Control';

import './App.styl';

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        type: 'black'
    }

    render() {
        const {type} = this.state;
        return (
            <div className="board-wrapper">
                <Control type={type}/>
                <Board type={type} checkType={type => {
                    this.setState({type: type});
                }}/>
            </div>
        );
    }
}
