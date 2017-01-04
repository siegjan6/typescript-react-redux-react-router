import * as React from "react";
import * as ReactDOM from "react-dom";

const STATS = {
  init: '',
  pulling: 'pulling',
  enough: 'pulling enough',
  refreshing: 'refreshing',
  refreshed: 'refreshed',
  reset: 'reset',
  loading: 'loading' // loading more
};
const endState = {
  loaderState: STATS.reset,
  pullHeight: 0
};

function addEvent(obj, type, fn) {
  if (obj.attachEvent) {
    obj['e' + type + fn] = fn;
    obj[type + fn] = function () { obj['e' + type + fn](window.event); }
    obj.attachEvent('on' + type, obj[type + fn]);
  } else
    obj.addEventListener(type, fn, false);
}
function removeEvent(obj, type, fn) {
  if (obj.detachEvent) {
    obj.detachEvent('on' + type, obj[type + fn]);
    obj[type + fn] = null;
  } else
    obj.removeEventListener(type, fn, false);
}

export default class ReactPullLoad extends React.Component<any,any> {
  container:any;
  defaultConfig:any;
  refs:any;
  startX:any;
  startY:any;
  static defaultProps = {
    hasMore: true,//是否还有更多内容可加载
    offsetScrollTop: 1,//
    downEnough: 100,//下拉距离是否满足要求
    distanceBottom: 100,//距离底部距离触发加载更多
    isBlockContainer: false,//是否开启使用组件根 DOM 作为外部容器 contianer
    className: ""
  }
  constructor(props) {
    super(props)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onPullDownMove = this.onPullDownMove.bind(this)
    this.onPullDownRefresh = this.onPullDownRefresh.bind(this)
    this.onPullUpMove = this.onPullUpMove.bind(this)
    this.container = null
    this.state = {
      loaderState: STATS.init,
      pullHeight: 0
    };
  }

  componentDidMount() {
    const {isBlockContainer, offsetScrollTop, downEnough, distanceBottom} = this.props;
    let _Dom = ReactDOM.findDOMNode(this);
    this.defaultConfig = {
     // container: isBlockContainer ? _Dom : document.body,
     container:_Dom,
      offsetScrollTop: offsetScrollTop,
      downEnough: downEnough,
      distanceBottom: distanceBottom
    };
    addEvent(_Dom, "touchstart", this.onTouchStart)
    addEvent(_Dom, "touchmove", this.onTouchMove)
    addEvent(_Dom, "touchend", this.onTouchEnd)


  }
  componentWillUnmount() {
      let _Dom = ReactDOM.findDOMNode(this);
    removeEvent(_Dom, "touchstart", this.onTouchStart)
    removeEvent(_Dom, "touchmove", this.onTouchMove)
    removeEvent(_Dom, "touchend", this.onTouchEnd)
  }
  // 拖拽的缓动公式 - easeOutSine
  easing(distance) {
    // t: current time, b: begInnIng value, c: change In value, d: duration
    var t = distance;
    var b = 0;
    var d = screen.availHeight; // 允许拖拽的最大距离
    var c = d / 2.5; // 提示标签最大有效拖拽距离

    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  }
  canRefresh() {
    return this.props.onRefresh && [STATS.refreshing, STATS.loading].indexOf(this.state.loaderState) < 0;
  }

  onPullDownMove(data) {
    if(!this.canRefresh())return false;

    let loaderState, diff = data[0].touchMoveY - data[0].touchStartY;
    if (diff < 0) {
      diff = 0;
    }
    diff = this.easing(diff);
    
    if (diff > this.defaultConfig.downEnough) {
      loaderState = STATS.enough
    } else {
      loaderState = STATS.pulling
    }
    this.setState({
      pullHeight: diff,
      loaderState: loaderState
    })
  }

  onPullDownRefresh() {
    if(!this.canRefresh())return false;

    if (this.state.loaderState === STATS.pulling) {
      this.setState(endState)
    } else {
      this.setState({
        pullHeight: 0,
        loaderState: STATS.refreshing
      })
      if (typeof this.props.onRefresh === "function") {
        this.props.onRefresh(() => {
          this.setState({
            pullHeight: 0,
            loaderState: STATS.refreshed
          })
          setTimeout(()=>{
            this.setState(endState)
          },1000)
        }, () => {
          this.setState(endState)
        })
      }
    }
  }

  onPullUpMove(data) {
    if(!this.canRefresh())return false;
    const { hasMore, onLoadMore} = this.props
    if (typeof this.props.onLoadMore === "function" && hasMore) {
      this.setState({
        pullHeight: 0,
        loaderState: STATS.loading
      })

      onLoadMore(()=>{
        this.setState(endState)
      });
    }
  }

  onTouchStart(event) {
    var targetEvent = event.changedTouches[0];
    //console.log(targetEvent);
    this.startX = targetEvent.clientX;
    this.startY = targetEvent.clientY;
  }

  onTouchMove(event) {
    let scrollTop = this.defaultConfig.container.parentNode.scrollTop,
      scrollH = this.defaultConfig.container.parentNode.scrollHeight,
      conH = this.defaultConfig.container === document.body ? document.documentElement.clientHeight : this.defaultConfig.container.parentNode.offsetHeight,
      targetEvent = event.changedTouches[0],
      curX = targetEvent.clientX,
      curY = targetEvent.clientY,
      diffX = curX - this.startX,
      diffY = curY - this.startY;
    //判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离
    if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
      //滚动距离小于设定值 &&回调onPullDownMove 函数，并且回传位置值

      if (diffY > 5 && scrollTop < this.defaultConfig.offsetScrollTop) {
        //阻止执行浏览器默认动作
        event.preventDefault();
        this.onPullDownMove([{
          touchStartY: this.startY,
          touchMoveY: curY
        }]);
      } //滚动距离距离底部小于设定值
      else if (diffY < 0 && (scrollH - scrollTop - conH) < this.defaultConfig.distanceBottom) {
        //阻止执行浏览器默认动作
        // event.preventDefault();
        this.onPullUpMove([{
          touchStartY: this.startY,
          touchMoveY: curY
        }]);
      }
    }
  }

  onTouchEnd(event) {
    let scrollTop = this.defaultConfig.container.scrollTop,
      targetEvent = event.changedTouches[0],
      curX = targetEvent.clientX,
      curY = targetEvent.clientY,
      diffX = curX - this.startX,
      diffY = curY - this.startY;

    //判断垂直移动距离是否大于5 && 横向移动距离小于纵向移动距离
    if (Math.abs(diffY) > 5 && Math.abs(diffY) > Math.abs(diffX)) {
      if (diffY > 5 && scrollTop < this.defaultConfig.offsetScrollTop) {
        //回调onPullDownRefresh 函数，即满足刷新条件
        this.onPullDownRefresh();
      }
    }
  }

  render() {
    const {
        children,
        onRefresh,
        onLoadMore,
        hasMore,
        initializing,
        className,
        offsetScrollTop,
        downEnough,
        distanceBottom,
        isBlockContainer,
        ...other
    } = this.props

    const {pullHeight, loaderState} = this.state

    const msgStyle = pullHeight ? {
      WebkitTransform: `translate3d(0, ${pullHeight}px, 0)`,
      transform: `translate3d(0, ${pullHeight}px, 0)`
    } : null;

    const symbolTop = pullHeight - 50 > 0 ? pullHeight - 50 : 0;
    const msgStyle2 = pullHeight ? {
      WebkitTransform: `translate3d(0, ${symbolTop}px, 0)`,
      transform: `translate3d(0, ${symbolTop}px, 0)`
    } : null;

    const boxClassName = `${className} tloader state-${loaderState}`;

    return (
      <div {...other} className={boxClassName} ref="container" id="tloaderBox">
        <div className="tloader-symbol" style={msgStyle2}>
          <p className="tloader-msg"><i></i></p>
          <p className="tloader-loading">
            <i className="ui-loading"></i>
          </p>
        </div>
        <div className="tloader-body" style={msgStyle}>
          {children}
        </div>
        <div className="tloader-footer">
          { !hasMore ? <p className="tloader-btn"></p> : null}
          <p className="tloader-loading">
            <i className="ui-loading"></i>
          </p>
        </div>
      </div>
    )
  }
}
