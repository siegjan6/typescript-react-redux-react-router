import * as React from "react";
import * as classNames from "classnames";
export default class Row extends React.Component<any,any> {

    /**
     * 删格布局容器
     */
    render() {
        const {children,className} = this.props;
        let addClassName = className;
        let Cls = classNames('ui-row', {
            [`${addClassName}`]: className
        });
        return (<div className = {Cls} >
                    {children}
                </div>
                    );
    }

}