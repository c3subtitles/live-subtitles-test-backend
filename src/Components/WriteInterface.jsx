// @flow
import { addError } from '../Services/notifications';
import { Connect, Permission } from '../Helper';
import { joinRoom, leaveRoom } from '../Actions/rooms';
import Loading from 'react-loader';
import Radium from 'radium';
import React from 'react';
import ShortcutList from './ShortcutList';
import UserList from './UserList';
import WriteArea from './WriteArea';

const props = state => ({
  user: state.user,
  room: state.currentRoom,
});

type Props = {
  params: {
    roomId: string,
  },
  room?: Room,
  user?: ClientUser,
};

@Permission()
@Connect(props)
@Radium
export default class WriteInterface extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  props: Props;
  static style = {
    wrapper: {
      display: 'flex',
      WebkitFlex: '1 1 0',
      flex: '1 1 0',
      overflow: 'hidden',
    },
    mainContent: {
      WebkitFlex: '1 1 0',
      flex: '1 1 0',
    },
  };
  componentWillReceiveProps(nextProps: Props) {
    const { room, user } = nextProps;
    if (room && room.locked && user && !user.role.canJoinLocked) {
      this.context.router.transitionTo('/write');
      addError({ title: 'Room locked', message: 'The room got locked. You do not have the permission to be in locked Rooms' });
    }
  }
  componentWillMount() {
    const { roomId } = this.props.params;
    joinRoom(Number.parseInt(roomId, 10));
  }
  componentWillUnmount() {
    const { roomId } = this.props.params;
    leaveRoom(Number.parseInt(roomId, 10));
  }
  render() {
    const style = WriteInterface.style;
    const { room } = this.props;
    if (!room) {
      return <Loading/>;
    }
    return (
      <div style={style.wrapper}>
        <WriteArea/>
        <UserList/>
        <ShortcutList/>
      </div>
    );
  }
}
