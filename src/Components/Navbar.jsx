// @flow
import { Divider, MenuItem, AppBar, IconMenu, FlatButton } from 'material-ui';
import { Connect } from '../Helper';
import { hasPermission } from '../Services/user';
import { lockRoom, speechLockRoom } from '../Actions/rooms';
import Radium from 'radium';
import React from 'react';

type Props = {
  currentRoom?: Object,
  loggedIn?: bool,
  readMode?: bool,
  user?: ClientUser,
  writeMode?: bool,
};

@Radium
@Connect(state => ({
  currentRoom: state.currentRoom,
  readMode: state.read,
  user: state.user,
  writeMode: state.write,
}))
export default class Navbar extends React.Component {
  props: Props;
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  static style = {
    bar: {
      lineHeight: '48px',
      minHeight: 48,
    },
    title: {
      alignItems: 'center',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      flex: '1 1 0',
      fontSize: 24,
      fontWeight: 400,
      justifyContent: 'flex-end',
      letterSpacing: 0,
      margin: 0,
      overflow: 'hidden',
      paddingTop: 0,
      position: 'relative',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    innerTitle: {
      flex: '1 1 0',
    },
    menu: {
      alignSelf: 'center',
      marginTop: 0,
    },
    menuButton: {
      alignSelf: 'center',
      boxShadow: 'initial',
      height: 'initial',
    },
    menuButtonLabel: {
      color: '#fff',
    },
    room: {
      marginLeft: 10,
      marginRight: 10,
    },
    conditionalButton: {
      height: '75%',
      color: '#fff',
    },
  };
  home = () => {
    this.context.router.transitionTo('/');
  };
  write = () => {
    this.context.router.transitionTo('/write');
  };
  writeRoom = (e: Event) => {
    e.stopPropagation();
    const { currentRoom } = this.props;
    if (currentRoom) {
      this.context.router.transitionTo(`/write/${currentRoom.id}`);
    } else {
      this.write();
    }
  };
  lockRoom = (e: Event) => {
    e.stopPropagation();
    const { currentRoom } = this.props;
    if (!currentRoom) {
      return;
    }
    lockRoom(currentRoom.id, !currentRoom.locked);
  };
  speechLockRoom = (e: Event) => {
    e.stopPropagation();
    const { currentRoom } = this.props;
    if (!currentRoom) {
      return;
    }
    speechLockRoom(currentRoom.id, !currentRoom.speechLocked);
  };
  profile = () => {
    this.context.router.transitionTo('/profile');
  };
  logout = () => {
    this.context.router.transitionTo('/logout');
  };
  rooms = () => {
    this.context.router.transitionTo('/roomManagement');
  };
  users = () => {
    this.context.router.transitionTo('/userManagement');
  };
  login = () => {
    this.context.router.transitionTo('/login');
  };
  register = () => {
    this.context.router.transitionTo('/register');
  };
  getGuestMenu() {
    const style = Navbar.style;
    return (
      <IconMenu desktop iconButtonElement={
          <FlatButton style={style.menuButton} label="Menu"/>
        }>
        <MenuItem onClick={this.login} primaryText="Login"/>
        <MenuItem onClick={this.register} primaryText="Register"/>
      </IconMenu>
    );
  }
  getTitle() {
    const style = Navbar.style;
    const { currentRoom, loggedIn, readMode, writeMode, user } = this.props;
    if (!user) {
      return null;
    }
    let conditionalButton;
    if (loggedIn) {
      if (readMode) {
        conditionalButton = (
          <FlatButton backgroundColor="transparent" hoverColor="rgba(255, 255, 255, 0.4)" onClick={this.writeRoom} style={style.conditionalButton} label="Write"/>
        );
      } else if (writeMode && currentRoom) {
        conditionalButton = [
          false && user.role.canSpeechLock && (<FlatButton key="s" backgroundColor="transparent" hoverColor="rgba(255, 255, 255, 0.4)" onClick={this.speechLockRoom} style={style.conditionalButton} label={currentRoom.speechLocked ? 'Speech unlock' : 'Speech lock'}/>),
          user.role.canLock && (<FlatButton key="l" backgroundColor="transparent" hoverColor="rgba(255, 255, 255, 0.4)"
            onClick={this.lockRoom} style={style.conditionalButton} label={currentRoom.locked ? 'Unlock' : 'Lock'}/>),
        ];
      }
    }
    return (
      <h1 onClick={this.home} style={style.title}>
        <div style={style.innerTitle}>L2S2{currentRoom && [<span key="s" style={style.room}> - </span>, currentRoom.name]}</div>
        {conditionalButton}
      </h1>
    );
  }
  render() {
    const { loggedIn, user } = this.props;
    const style = Navbar.style;
    let iconElementRight;
    if (loggedIn) {
      const conditionalMenu = [];
      if (hasPermission(['canCreateRoom', 'canDeleteRoom'])) {
        conditionalMenu.push(<MenuItem key="r" onClick={this.rooms} primaryText="Rooms"/>);
      }
      if (hasPermission(['canCreateUser', 'canDeleteUser', 'canActivateUser'])) {
        conditionalMenu.push(<MenuItem key="u" onClick={this.users} primaryText="Usermanagement"/>);
      }
      if (conditionalMenu.length > 0) {
        conditionalMenu.push(<Divider key="d"/>);
      }
      iconElementRight = (
        <IconMenu desktop iconButtonElement={
            <FlatButton style={style.menuButton} label={user ? user.username : 'Guest'}/>
          }>
          <MenuItem onClick={this.profile} primaryText="Profile"/>
          <MenuItem onClick={this.write} primaryText="Write"/>
          <Divider/>
          {conditionalMenu}
          <MenuItem primaryText="Logout" onClick={this.logout}/>
        </IconMenu>
      );
    } else {
      iconElementRight = this.getGuestMenu();
    }
    return (
      <AppBar style={style.bar} iconStyleRight={style.menu} showMenuIconButton={false} title={this.getTitle()} iconElementRight={iconElementRight}/>
    );
  }
}
