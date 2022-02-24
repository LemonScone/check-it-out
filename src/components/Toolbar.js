import React from 'react';
import { Button, ButtonGroup, Card, Divider } from '@mui/material';
import MuiGrid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { PlayArrow, Pause, ArrowForwardIos } from '@mui/icons-material';
import { ArrowBackIosNew } from '@mui/icons-material';

/// 기본값으로 사용할 grid 컴포넌트 설정을 초기화한다.
const Grid = styled(MuiGrid)(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  ...theme.typography.body2,
  '& [role="separator"]': {
    margin: theme.spacing(0, 2),
  },
}));

/// 날짜를 이동할 수 있도록 버튼 그룹 컴포넌트를 생성합니다.
/// 이전 또는 다음 날짜로 이동할 화살표 버튼(<, >)과 이동한 날짜를 보여주는 버튼으로 구성합니다.
const MoveDate = (props) => {
  //leftArrowClickHandler, rightArrowClickHandler : 버튼에 적용할 이벤트를 props로 받아옵니다.
  //getDateFormat : 이동한 날짜를 형식에 맞게 포맷팅하는 메서드를 props로 받아옵니다.
  //stayDay : 선택한 날짜가 현재인 경우 다음 날짜로 이동할 수 없도록 버튼을 disabled 처리합니다.
  const { leftArrowClickHandler, rightArrowClickHandler, getDateFormat, stayDay } = props;
  return (
    <ButtonGroup variant="outlined" aria-label="outlined primary button group">
      <Button onClick={leftArrowClickHandler}>
        <ArrowBackIosNew sx={{ fontSize: 15 }} />
      </Button>
      <Button>{getDateFormat()}</Button>
      <Button
        onClick={rightArrowClickHandler}
        disabled={
          stayDay.toISOString().substring(0, 10) === new Date().toISOString().substring(0, 10)
            ? true
            : false
        }>
        <ArrowForwardIos sx={{ fontSize: 15 }} />
      </Button>
    </ButtonGroup>
  );
};

/// 타이머 기능을 시작/정지할 버튼입니다.
const TrackTime = (props) => {
  /// isAction : 타이머 기능이 활성화 되었는지에 대한 플래그 값입니다. 타이머 기능이 활성화 되었으면 true입니다. 버튼의 색과 아이콘 및 텍스트도 해당 props에 따라 분기처리합니다.
  /// trackTimeClickHandler : 시작/정지 버튼 이벤트를 props로 받아옵니다.
  const { isAction, trackTimeClickHandler } = props;
  return (
    <Button
      variant="contained"
      onClick={trackTimeClickHandler}
      color={isAction ? 'error' : 'primary'}
      startIcon={isAction ? <Pause /> : <PlayArrow />}>
      {isAction ? 'PAUSE' : 'START'}
    </Button>
  );
};

/// 타이머 기능의 시작시간, 종료시간, 총 작업시간을 보여줍니다.
const DisplayTracking = (props) => {
  /// 시작/종료 시간과 총 작업시간을 props로 받아온 후 p 태그에 적용합니다.
  const { start, finish, workingTimeFormat } = props;
  return (
    <>
      <Grid item xs>
        <h2>시작시간</h2>
        <p>{start}</p>
      </Grid>
      <Divider orientation="vertical" flexItem></Divider>
      <Grid item xs>
        <h2>종료시간</h2>
        <p>{finish}</p>
      </Grid>
      <Divider orientation="vertical" flexItem></Divider>
      <Grid item xs>
        <h2>총 작업시간</h2>
        <p>{workingTimeFormat()}</p>
      </Grid>
    </>
  );
};

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /* start : 시작시간, stop : 종료시간, workingTime : 총 작업시간(초 단위), isAction : 작업 진행 유무, interval : clearInterval을 위해 저장, stayDay : 조회일자 */
      start: '',
      finish: '',
      workingTime: 0,
      isAction: false,
      interval: null,
      intervalForActiveWin: null,
      stayDay: new Date(),
    };
    // this.trackTimeClickHandler = this.trackTimeClickHandler.bind(this);
    // this.addTime = this.addTime.bind(this);
  }

  componentDidMount = () => {
    console.log('ipcRender start');
    this.setState({ intervalForActiveWin: setInterval(this.electronActiveWin, 2000) });
  };

  electronActiveWin = () => {
    const electron = window.require('electron');
    electron.ipcRenderer.send('ACTIVE_WINDOW', '');
    electron.ipcRenderer.on('REPLY_ACTIVE_WINDOW', (event, payload) => {
      console.log('payload : ', payload);
    });
  };

  /// TrackTime 컴포넌트의 클릭 이벤트로 넘겨줄 메서드입니다.
  trackTimeClickHandler = () => {
    const { isAction, start, interval } = this.state;
    this.setState({
      start: isAction ? start : new Date().toLocaleString(),
      finish: isAction ? new Date().toLocaleString() : '작업중',
      isAction: !isAction,
    });

    console.log(this.state.isAction);

    if (!isAction) {
      this.setState({ interval: setInterval(this.addTime, 1000) });
    } else {
      clearInterval(interval);
    }
  };

  /// MoveDate 컴포넌트의 구성 요소인 이전 날짜로 이동하는 버튼 클릭 이벤트로 넘겨줄 메서드입니다.
  leftArrowClickHandler = () => {
    this.updateDate('P');
  };

  /// MoveDate 컴포넌트의 구성 요소인 다음 날짜로 이동하는 버튼 클릭 이벤트로 넘겨줄 메서드입니다.
  rightArrowClickHandler = () => {
    this.updateDate('N');
  };

  /// MoveDate 컴포넌트의 날짜 이동 이벤트가 발생하면 이전/다음 날짜에 따라 이동할 날짜를 계산 후 stayDay에 저장합니다.
  updateDate = (action) => {
    const { stayDay } = this.state;

    if (action === 'P') {
      stayDay.setDate(stayDay.getDate() - 1);
    } else if (action === 'N') {
      stayDay.setDate(stayDay.getDate() + 1);
    }

    this.setState({ stayDay });
  };

  /// 작업시간을 계산하는 메서드입니다. workingTime이라는 state 값에 1씩 더합니다.
  /// 즉, interval로 실행하여 1초씩 증가시키는 메서드입니다.
  addTime = () => {
    this.setState({ workingTime: this.state.workingTime + 1 });
  };

  /// workingTime이라는 state는 초 단위로 계산이 되므로 hh:mm:ss 형태로 포맷팅합니다.
  workingTimeFormat = () => {
    const { workingTime } = this.state;
    const hour = parseInt(workingTime / 60 / 60).toString();
    const minute = parseInt(workingTime / 60).toString();
    const second = (workingTime % 60).toString();

    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
  };

  /// MoveDate 컴포넌트의 이전/다음 버튼으로 이동한 날짜를 yyyy-dd-mm 형태로 포맷팅하여 리턴합니다.
  /// 어떠한 버튼도 클릭하지 않은 상태라면 현재 날짜를 포맷팅합니다. 따라서 프로그램 실행하면 현재 날짜를 리턴합니다.
  getDateFormat = () => {
    const { stayDay } = this.state;
    let today = null;

    if (stayDay) {
      today = stayDay;
    } else {
      today = new Date();
    }

    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString();
    const date = today.getDate().toString();

    //this.setState({ stayDay: today });
    return `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`;
  };

  render() {
    const { start, finish, isAction, stayDay } = this.state;
    return (
      <Card variant="outlined">
        <Grid container sx={{ p: 2, m: 0 }}>
          <Grid item xs={6} sx={{ p: 0, display: 'flex' }}>
            <MoveDate
              stayDay={stayDay}
              leftArrowClickHandler={this.leftArrowClickHandler}
              rightArrowClickHandler={this.rightArrowClickHandler}
              getDateFormat={this.getDateFormat}></MoveDate>
          </Grid>
          <Grid item xs={6} sx={{ p: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <TrackTime trackTimeClickHandler={this.trackTimeClickHandler} isAction={isAction} />
          </Grid>
        </Grid>
        <Divider></Divider>
        <Grid container>
          <DisplayTracking
            start={start}
            finish={finish}
            workingTimeFormat={this.workingTimeFormat}
          />
        </Grid>
      </Card>
    );
  }
}

export default Toolbar;
