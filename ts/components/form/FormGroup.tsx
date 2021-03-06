import * as React from "react";
import * as classNames from "classnames";
export default class FormGroup extends React.Component<any,any> {
    /**
     * 表单布局 块布局(默认),水平布局(horizontal),行内布局(inline)
     * @type {{type: string}}
     */
    static defaultProps = {
        type: 'horizontal'
    }

    constructor(props){
        super(props);
    }
    /**
     * body 主容器 包括头部和菜单
     */
    render() {
        const {children,horizontal,inline,className} = this.props;
        let addClassName = className;
        let Cls = classNames(
            'ui-form',
            {'horizontal':horizontal,
                'inline':inline,
                [`${addClassName}`]: className});
        return (<div className = {Cls}>
                    {children}
                </div>
                    );
    }

}