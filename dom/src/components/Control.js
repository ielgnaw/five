/**
 * @file 控制组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';

import './Control.styl';

export default class Control extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="control">
                <button>悔棋</button>
                <button>撤销悔棋</button>
                <span className="info">
                    {`当前${this.props.type === 'black' ? '黑方' : '白方'}下`}
                </span>
            </div>
        );
    }
}
