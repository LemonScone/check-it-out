import React, { useEffect, useState, useRef } from 'react';
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

function Toolbar() {
  let [start, setStart] = useState('');
  let [finish, setFinish] = useState('');
  let [workingTime, setWorkingTime] = useState(0);
  let [isOnTracked, setIsOnTracked] = useState(false);
  let [intervalForTimer, setIntervalForTimer] = useState(null);
  let [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    console.log('useEffect');

    return function cleanup() {
      console.log('cleanup');
    };
  });

  // TODO useState로 setInterval 안됨...
  //setIntervalForTimer(setInterval(addTime, 1000));
  useInterval(() => {
    if (isOnTracked) setIntervalForTimer(addTime());
  }, 1000);

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  function handleTrackButtonClick() {
    setStart(isOnTracked ? start : new Date().toLocaleString());
    setFinish(isOnTracked ? new Date().toLocaleString() : '작업중');
    setIsOnTracked(!isOnTracked);

    // if (!isOnTracked) {
    //   // TODO useState로 setInterval 안됨...
    //   //setIntervalForTimer(setInterval(addTime, 1000));
    //   useInterval(() => {
    //     setIntervalForTimer(addTime());
    //   }, 1000);
    // } else {
    //   clearInterval(intervalForTimer);
    // }
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
    setSelectedDay(new Date(selectedDay));
  }

  function addTime() {
    setWorkingTime(workingTime + 1);
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
