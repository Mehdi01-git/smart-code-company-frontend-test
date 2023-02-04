import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import absences from "../assets/absences.json";
import members from "../assets/members.json";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { visuallyHidden } from "@mui/utils";
import { createEvent } from "ics";
import { saveAs } from "file-saver";
import { Download } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

function createData(key, img, name, type, period, memNote, status, admitNote) {
  return {
    key,
    img,
    name,
    type,
    period,
    memNote,
    status,
    admitNote,
  };
}

const rows = absences.payload.map((absence, i) => {
  return createData(
    i,
    members.payload.map((member) => {
      return member.userId === absence.userId ? member.image : "";
    }),
    members.payload.map((member) => {
      return member.userId === absence.userId ? member.name : "";
    }),
    absence.type,
    `from ${absence.startDate} to ${absence.endDate}`,
    absence.memberNote === "" ? "-" : absence.memberNote,
    absence.rejectedAt !== null
      ? "Rejected"
      : absence.confirmedAt !== null
      ? "Confirmed"
      : "Requested",
    absence.admitterNote === "" ? "-" : absence.admitterNote
  );
});

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
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
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
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Member name",
  },
  {
    id: "type",
    numeric: true,
    disablePadding: false,
    label: "Type of absence",
  },
  {
    id: "period",
    numeric: true,
    disablePadding: false,
    label: "Period",
  },
  {
    id: "memNote",
    numeric: true,
    disablePadding: false,
    label: "Member note",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "admitNote",
    numeric: true,
    disablePadding: false,
    label: "Admitter note ",
  },
  {
    id: "download",
    numeric: true,
    disablePadding: true,
    label: "Download",
  },
  {
    id: "download",
    numeric: true,
    disablePadding: true,
    label: "",
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
        <TableCell padding="normal"></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              data-testid="filter"
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: "600",
              }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
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
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{
            flex: "1 1 100%",
            marginLeft: "15px",
            fontFamily: "Montserrat, sans-serif",
          }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Absences ({absences.payload.length})
        </Typography>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function EnhancedTable() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("type");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [isLoading, setLoading] = React.useState(true);
  function someRequest() {
    //Simulates a request; makes a "promise" that'll run for 1 second
    return new Promise((resolve) => setTimeout(() => resolve(), 1000));
  }
  React.useEffect(() => {
    someRequest().then(() => setLoading(!isLoading));
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  console.log(page);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />

            <TableBody className="tableBody">
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  let comma = " ,,,,,";
                  const event = {
                    start: [2018, 5, 30, 6, 30],
                    duration: { hours: 6, minutes: 30 },
                    title: `Absences (${rows.length})`,
                    location:
                      "Folsom Field, University of Colorado (finish line)",
                    url: "http://www.bolderboulder.com/",
                    geo: { lat: 40.0095, lon: 105.2669 },
                    categories: [
                      "10k races",
                      "Memorial Day Weekend",
                      "Boulder CO",
                    ],
                    status: "CONFIRMED",
                    busyStatus: "BUSY",
                    organizer: {
                      name: "Admin",
                      email: "Race@BolderBOULDER.com",
                    },
                    description: `
                    Member Name : ${String(row.name).replace(comma, "")} \r
                    Type of absence : ${row.type} \r
                    Period : ${row.period}  \n
                    MemberNote : ${row.memNote} \n
                    Status : ${row.status} \n
                    Admitter note : ${row.admitNote}\r

                    `,

                    attendees: [],
                  };
                  const handleSave = () => {
                    createEvent(event, (error, value) => {
                      const blob = new Blob([value], {
                        type: "text/plain;charset=utf-8",
                      });
                      saveAs(blob, "event-schedule.ics");
                    });
                  };
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.key}
                      selected={isItemSelected}
                    >
                      <TableCell padding="none">
                        {/* <img
                          className="avatar"
                          src="https://picsum.photos/200/300"
                          alt="avatar"
                        /> */}
                      </TableCell>

                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "16px",
                          color: "rgba(100, 100, 111, )",
                        }}
                      >
                        {row.name}
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "16px",
                          textTransform: "capitalize",
                          color: "rgba(100, 100, 111, ) ",
                        }}
                        align="right"
                      >
                        {row.type}
                      </TableCell>
                      <TableCell
                        style={{
                          width: "20%",
                          fontFamily: "Poppins, sans-serif",
                          textTransform: "capitalize",
                          color: "rgba(100, 100, 111, )",
                        }}
                        align="right"
                      >
                        {row.period}
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          color: "rgba(100, 100, 111, )",
                        }}
                        align="right"
                      >
                        {row.memNote}
                      </TableCell>
                      <TableCell
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "16px",
                          color: "rgba(100, 100, 111, )",
                        }}
                        align="right"
                      >
                        {row.status}
                      </TableCell>
                      <TableCell
                        style={{
                          width: "20%",
                          fontFamily: "Poppins, sans-serif",
                          color: "rgba(100, 100, 111, )",
                        }}
                        align="right"
                      >
                        {row.admitNote}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Download iCal file">
                          <button
                            onClick={handleSave}
                            style={{
                              marginTop: "7px",
                              marginLeft: "20px",
                              cursor: "pointer",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "20px",
                            }}
                          >
                            <Download className="downButton" />
                          </button>
                        </Tooltip>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
              <div
                style={{
                  display: isLoading ? "grid" : "none",
                }}
                className="loader-container"
              >
                <div className="lds-roller">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          data-testid="paginate"
        />
      </Paper>
    </Box>
  );
}
