import React from 'react';
import { Button, ButtonGroup, Card, Divider } from '@mui/material';
import MuiGrid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { PlayArrow, Pause, ArrowForwardIos } from '@mui/icons-material';
import { ArrowBackIosNew } from '@mui/icons-material';

const Grid = styled(MuiGrid)(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  ...theme.typography.body2,
  '& [role="separator"]': {
    margin: theme.spacing(0, 2),
  },
}));

const MoveDate = (props) => {
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

const TrackTime = (props) => {
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

const DisplayTracking = (props) => {
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
      stayDay: new Date(),
    };
    // this.trackTimeClickHandler = this.trackTimeClickHandler.bind(this);
    // this.addTime = this.addTime.bind(this);
  }

  trackTimeClickHandler = () => {
    const { isAction, start, interval } = this.state;
    this.setState({
      start: isAction ? start : new Date().toLocaleString(),
      finish: isAction ? new Date().toLocaleString() : '작업중',
      isAction: !isAction,
    });

    if (!isAction) {
      this.setState({ interval: setInterval(this.addTime, 1000) });
    } else {
      clearInterval(interval);
    }
  };

  leftArrowClickHandler = () => {
    this.updateDate('P');
  };

  rightArrowClickHandler = () => {
    this.updateDate('N');
  };

  updateDate = (action) => {
    const { stayDay } = this.state;

    if (action === 'P') {
      stayDay.setDate(stayDay.getDate() - 1);
    } else if (action === 'N') {
      stayDay.setDate(stayDay.getDate() + 1);
    }

    this.setState({ stayDay });
  };

  addTime = () => {
    this.setState({ workingTime: this.state.workingTime + 1 });
  };

  workingTimeFormat = () => {
    const { workingTime } = this.state;
    const hour = parseInt(workingTime / 60 / 60).toString();
    const minute = parseInt(workingTime / 60).toString();
    const second = (workingTime % 60).toString();

    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
  };

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
