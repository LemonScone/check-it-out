import React from 'react'
import { Button, ButtonGroup, Box, Card, Divider } from '@mui/material'
import MuiGrid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import { PlayArrow, Pause, ArrowForwardIos } from '@mui/icons-material'
import { ArrowBackIosNew } from '@mui/icons-material'

const Grid = styled(MuiGrid)(({ theme }) => ({
  width: '100%',
  textAlign: 'center',
  ...theme.typography.body2,
  '& [role="separator"]': {
    margin: theme.spacing(0, 2),
  },
}))

class Toolbar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      /* start : 시작시간, stop : 종료시간, workingTime : 총 작업시간(초 단위), isAction : 작업 진행 유무, interval : clearInterval을 위해 저장 */
      start: '',
      finish: '',
      workingTime: 0,
      isAction: false,
      interval: null,
    }
    this.updateChecking = this.updateChecking.bind(this)
    this.addTime = this.addTime.bind(this)
  }

  updateChecking = () => {
    const { isAction, start, interval } = this.state
    this.setState({
      start: isAction ? start : new Date().toLocaleString(),
      finish: isAction ? new Date().toLocaleString() : '작업중',
      isAction: !isAction,
    })

    if (!isAction) {
      this.setState({ interval: setInterval(this.addTime, 1000) })
    } else {
      clearInterval(interval)
    }
  }

  addTime = () => {
    this.setState({ workingTime: this.state.workingTime + 1 })
  }

  workingTimeFm = () => {
    const { workingTime } = this.state
    const hour = parseInt(workingTime / 60 / 60).toString()
    const minute = parseInt(workingTime / 60).toString()
    const second = (workingTime % 60).toString()

    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`
  }

  getDateFormat = () => {
    const today = new Date()
    const year = today.getFullYear().toString()
    const month = (today.getMonth() + 1).toString()
    const date = today.getDate().toString()
    return `${year}-${month.padStart(2, '0')}-${date.padStart(2, '0')}`
  }

  render() {
    const { start, finish, isAction } = this.state
    return (
      <div>
        <Card variant="outlined">
          <Grid container spacing={2} sx={{ p: 2, m: 0 }}>
            <Grid item xs={6}>
              <Box sx={{ p: 0, display: 'flex' }} justify="center">
                <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                  <Button>
                    <ArrowBackIosNew sx={{ fontSize: 15 }} />
                  </Button>
                  <Button>{this.getDateFormat()}</Button>
                  <Button>
                    <ArrowForwardIos sx={{ fontSize: 15 }} />
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={this.updateChecking}
                  color={isAction ? 'error' : 'primary'}
                  startIcon={isAction ? <Pause /> : <PlayArrow />}>
                  {isAction ? 'PAUSE' : 'START'}
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Divider></Divider>
          <Grid container>
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
              <p>{this.workingTimeFm()}</p>
            </Grid>
          </Grid>
        </Card>
      </div>
    )
  }
}

export default Toolbar