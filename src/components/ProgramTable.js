import * as React from 'react';
import { format } from 'date-fns';
import nextId from 'react-id-generator';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';

function createData(key, name, title, startDate, finishedDate, distance, bundleId) {
  return {
    key,
    name,
    title,
    startDate,
    finishedDate,
    distance,
    bundleId,
  };
}
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'description',
    numeric: false,
    disablePadding: false,
    label: 'Description',
  },
  {
    id: 'startDate',
    numeric: false,
    disablePadding: false,
    label: '시작시간 (HH:mm:ss)',
  },
  {
    id: 'finishedDate',
    numeric: false,
    disablePadding: false,
    label: '종료시간 (HH:mm:ss)',
  },
  {
    id: 'distance',
    numeric: false,
    disablePadding: false,
    label: '활성시간',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export default function ProgramTable(props) {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name');

  const rows = props.programList.reverse().map((program) => {
    const { name, title, startDate, finishedDate, distance, bundleId } = program;
    return createData(
      nextId(),
      name,
      title,
      format(startDate, 'HH:mm:ss'),
      finishedDate && format(finishedDate, 'HH:mm:ss'),
      distance,
      bundleId,
    );
  });

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="사용된 program list" size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                const iconFileName = row.name.replace(/\s+/g, '-').toLowerCase();
                const assetPathPrefix = `../../assets/images`;
                const iconPath = `${assetPathPrefix}/${iconFileName}.png`;
                const handleIconError = (e) => (e.target.src = `${assetPathPrefix}/no-icon.png`);

                return (
                  <TableRow hover tabIndex={-1} key={row.key}>
                    <TableCell component="th" id={labelId} scope="row">
                      <div
                        style={{
                          display: 'inline-flex',
                          verticalAlign: 'top',
                          marginRight: '5px',
                        }}>
                        <img
                          style={{ width: '20px' }}
                          src={iconPath}
                          alt="application icon"
                          onError={handleIconError}></img>
                      </div>
                      {row.name}
                    </TableCell>
                    <TableCell align="left">{row.title}</TableCell>
                    <TableCell align="left">{row.startDate}</TableCell>
                    <TableCell align="left">{row.finishedDate}</TableCell>
                    <TableCell align="left">{row.distance}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
