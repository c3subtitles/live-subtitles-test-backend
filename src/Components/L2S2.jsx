import _ from 'lodash';
import { CSS } from '../Helper';
import GlobalCSS from './Global.CSS';
import Navbar from './Navbar';
import { setSystem } from '../Services/notifications';
import NotificationSystem from 'react-notification-system';
import Radium from 'radium';
import React from 'react';
import { loggedIn, loadFromLocalstorage } from '../Services/user';

function allowedRoute(path: string): bool {
  if (_.contains(path, 'login') || path === '/' || _.contains(path, 'register')) {
    return true;
  }
  return false;
}

@CSS(GlobalCSS)
@Radium
export default class L2S2 extends React.Component {
  static _globalCSS = true;
  static propTypes = {
    children: React.PropTypes.any,
  };
  static contextTypes = {
    history: React.PropTypes.any,
    location: React.PropTypes.any,
  };
  static childContextTypes = {
    transitionTo: React.PropTypes.func,
  };
  static style = {
    childWrap: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      padding: 10,
    },
  };
  getChildContext(): Object {
    return {
      transitionTo: url => {
        this.context.history.pushState(null, url);
      },
    };
  }
  state: Object = {
    ready: false,
  };
  componentWillMount() {
    loadFromLocalstorage().finally(() => {
      this.setState({
        ready: true,
      });
      if (!allowedRoute(this.context.location.pathname) && !loggedIn()) {
        this.context.history.pushState(null, '/login');
      }
    });
  }
  componentDidMount() {
    setSystem(this.refs.notification);
  }
  render() {
    const { children } = this.props;
    const { ready } = this.state;
    const style = L2S2.style;
    return (
      <div>
        <NotificationSystem ref="notification"/>
        {ready && [
          <Navbar key="nav"/>,
          <div key="wrap" style={style.childWrap}>
            {children}
          </div>,
        ]}
      </div>
    );
  }
}