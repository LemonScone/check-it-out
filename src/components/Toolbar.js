import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button, ButtonGroup, Card, Divider } from '@mui/material';
import MuiGrid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { PlayArrow, Pause, ArrowForwardIos } from '@mui/icons-material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useInterval } from '../hooks/intervalHooks.js';

const {
  electronBridge: { sendIpc, onIpc },
} = window;

const Grid = styled(MuiGrid)(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  ...theme.typography.body2,
  '& [role="separator"]': {
    margin: theme.spacing(0, 2),
  },
}));

const SelectDayButton = (props) => {
  const { handleLeftArrowButtonClick, handleRightArrowButtonClick, selectedDay } = props;
  return (
    <ButtonGroup variant="outlined" aria-label="outlined primary button group">
      <Button onClick={handleLeftArrowButtonClick}>
        <ArrowBackIosNew sx={{ fontSize: 15 }} />
      </Button>
      <Button>{formatDateWithHypen(selectedDay)}</Button>
      <Button
        onClick={handleRightArrowButtonClick}
        disabled={
          formatDateWithHypen(selectedDay) === formatDateWithHypen(new Date()) ? true : false
        }>
        <ArrowForwardIos sx={{ fontSize: 15 }} />
      </Button>
    </ButtonGroup>
  );
};

const Timer = (props) => {
  const { isOnTracked, handleTrackButtonClick } = props;
  return (
    <Button
      variant="contained"
      onClick={handleTrackButtonClick}
      color={isOnTracked ? 'error' : 'primary'}
      startIcon={isOnTracked ? <Pause /> : <PlayArrow />}>
      {isOnTracked ? 'PAUSE' : 'START'}
    </Button>
  );
};

const ShowTrackingTime = (props) => {
  const { start, finish, workingTime } = props;
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
        <p>{formatDateWithColon(workingTime)}</p>
      </Grid>
    </>
  );
};

const formatDateWithHypen = (day) => {
  const year = day.getFullYear().toString();
  const month = (day.getMonth() + 1).toString();
  const date = day.getDate().toString();

  return `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`;
};

const formatDateWithColon = (day) => {
  const hour = parseInt(day / 60 / 60).toString();
  const minute = parseInt(day / 60).toString();
  const second = (day % 60).toString();

  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
};

function Toolbar({ isOnTracked, setIsOnTracked }) {
  let [start, setStart] = useState('');
  let [finish, setFinish] = useState('');
  let [workingTime, setWorkingTime] = useState(0);
  //let [isOnTracked, setIsOnTracked] = useState(false);
  let [selectedDay, setSelectedDay] = useState(new Date());

  useInterval(
    () => {
      setWorkingTime(workingTime + 1);
    },
    isOnTracked ? 1000 : null,
  );

  function handleTrackButtonClick() {
    setStart(isOnTracked ? start : new Date().toLocaleString());
    setFinish(isOnTracked ? new Date().toLocaleString() : '작업중');
    setIsOnTracked(!isOnTracked);
  }

  function handleLeftArrowButtonClick() {
    selectDayByClicked('GO_YESTERDAY');
  }

  function handleRightArrowButtonClick() {
    selectDayByClicked('GO_TOMORROW');
  }

  function selectDayByClicked(action) {
    selectedDay.setDate(
      action === 'GO_YESTERDAY' ? selectedDay.getDate() - 1 : selectedDay.getDate() + 1,
    );
    //* selectedDay에 맞는 데이터를 electron-store에서 가져오기
    sendIpc('SELECTEDDAY_WINDOW', format(selectedDay, 'yyyy-MM-dd'));
    setSelectedDay(new Date(selectedDay));
  }

  return (
    <Card variant="outlined">
      <Grid container sx={{ p: 2, m: 0 }}>
        <Grid item xs={6} sx={{ p: 0, display: 'flex' }}>
          <SelectDayButton
            selectedDay={selectedDay}
            handleLeftArrowButtonClick={handleLeftArrowButtonClick}
            handleRightArrowButtonClick={handleRightArrowButtonClick}></SelectDayButton>
        </Grid>
        <Grid item xs={6} sx={{ p: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <Timer handleTrackButtonClick={handleTrackButtonClick} isOnTracked={isOnTracked} />
        </Grid>
      </Grid>
      <Divider></Divider>
      <Grid container>
        <ShowTrackingTime start={start} finish={finish} workingTime={workingTime} />
      </Grid>
    </Card>
  );
}

export default Toolbar;
