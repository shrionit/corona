import React, { useContext } from "react";
import {
  AppBar,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  fade,
  Grid,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import _ from "lodash";
import { FilterList } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import { useState, useEffect } from "react";
import API from "./api";
import "./App.css";
import CTable from "./components/CTable";
import { CountriesContext } from "./contextprovider";

const api = API();

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "alpha2Code", label: "ISO\u00a0Code", minWidth: 100 },
  { id: "capital", label: "Capital", minWidth: 170 },
  { id: "region", label: "Region", minWidth: 170 },
  {
    id: "population",
    label: "Population",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "area",
    label: "Area\u00a0(km\u00b2)",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("en-US"),
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    marginLeft: 0,
    display: "block",
    width: "100%",
    textAlign: "left",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    display: "block",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      display: "inline-block",
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const popRound = (o) => {
  const steps = {
    "1B": 1000000000,
    "500M": 500000000,
    "1M": 1000000,
    "500K": 500000,
    "1K": 1000,
  };
  let output = "";
  for (let k in steps) {
    if (steps[k] < o.population) {
      output = "Above " + k;
      break;
    } else {
      output = "Above 0";
    }
  }
  return { [output]: o.name };
};
const getLS = (key) => localStorage.getItem(key);
const setLS = (key, value) => localStorage.setItem(key, value);
const findMatch = (o, k) => {
  let flag = false;
  ["name", "capital", "region"].forEach((e) => {
    if (o[e].toUpperCase().includes(k.toUpperCase())) {
      flag = true;
      return;
    }
  });
  return flag;
};

const Home = () => {
  const classes = useStyles();
  const [filter, setFilter] = useState(null);
  const [countries, setCountries] = useContext(CountriesContext);
  useEffect(() => {
    let cached = getLS("countries");
    if (cached) {
      const data = JSON.parse(cached);
      setCountries(data);
    } else {
      (async () => {
        const data = await api.getAllCountries();
        setCountries(data);
        setLS("countries", JSON.stringify(data));
      })();
    }
  }, []);

  const params = ["region", "population"];
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (search) {
      const data = _.filter(countries, (o) => findMatch(o, search));
      setCountries(data);
    } else {
      setCountries(JSON.parse(getLS("countries")));
    }
  }, [search, setCountries]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [ftag, setFtag] = useState("region");
  const [fOption, setFOption] = useState([]);

  useEffect(() => {
    genFilterKeys();
    console.log("hello");
    if (filter !== null) {
      if (filter[ftag]) {
        setFOption(Object.keys(filter[ftag]));
      }
    }
  }, []);

  function handleFilterOpenClick() {
    setFilterOpen(true);
  }
  function handleFilterClose() {
    setFilterOpen(false);
  }
  function genFilterKeys() {
    const tmp = {
      selected: {
        region: [],
        population: [],
      },
    };
    countries.forEach((o) => {
      params.forEach((p) => {
        tmp[p] = tmp[p] || {};
        if (p === "region") {
          tmp[p][o[p]] = tmp[p][o[p]] || [];
          tmp[p][o[p]].push(o.name);
        }
        if (p === "population") {
          const [[pk, pv]] = Object.entries(popRound(o));
          if (tmp[p][pk]) {
            tmp[p][pk].push(pv);
          } else {
            tmp[p][pk] = [pv];
          }
        }
      });
    });
    setFilter(tmp);
    return true;
  }

  function handleFilterClick(k) {
    setFtag(k);
    console.log(k);
    setFOption(Object.keys(filter[k]));
  }

  function handleFilterOptionClick(k) {
    let o = { ...filter };
    console.log(o);
    setFilter((f) => {
      console.log(k);
      f.selected[ftag].push(k);
    });
  }

  return (
    <div>
      <Container fluid="true">
        <Card elevation={5} style={{ margin: "1em 0" }}>
          <div className={classes.root}>
            <AppBar position="relative">
              <Toolbar>
                <Typography className={classes.title} variant="h6" noWrap>
                  Material-UI
                </Typography>
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ "aria-label": "search" }}
                  />
                </div>
                <Tooltip title="Filter">
                  <IconButton
                    aria-label="filter"
                    aria-controls="filter button"
                    aria-haspopup="true"
                    color="inherit"
                    onClick={handleFilterOpenClick}
                  >
                    <FilterList />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </AppBar>
            <Dialog
              disableBackdropClick
              disableEscapeKeyDown
              open={filterOpen}
              onClose={handleFilterClose}
            >
              <DialogTitle>Apply Filters</DialogTitle>
              <DialogContent>
                {filter !== null ? (
                  <Paper style={{ minWidth: "600px" }}>
                    <Grid container spacing={2} style={{ width: "100%" }}>
                      <Grid item xs={2}>
                        <List>
                          {countries.length !== 0 &&
                            params.map((k) => (
                              <ListItem
                                button
                                selected={ftag === k}
                                key={k}
                                onClick={(e) => handleFilterClick(k)}
                              >
                                {_.startCase(_.toLower(k))}
                              </ListItem>
                            ))}
                        </List>
                      </Grid>
                      <Divider orientation="vertical" />
                      <Grid item xs={2}>
                        {fOption
                          ? fOption.map((fo, i) => {
                              return (
                                <ListItemIcon
                                  button
                                  key={fo + i}
                                  onClick={(e) => {
                                    handleFilterOptionClick(fo);
                                  }}
                                >
                                  <ListItemIcon>
                                    <Checkbox
                                      edge="start"
                                      disableRipple
                                      checked={false}
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    id={i + fo}
                                    primary={_.startCase(_.toLower(fo))}
                                  />
                                </ListItemIcon>
                              );
                            })
                          : ""}
                        ;
                      </Grid>
                    </Grid>
                  </Paper>
                ) : (
                  ""
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleFilterClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={handleFilterClose} color="primary">
                  Apply
                </Button>
              </DialogActions>
            </Dialog>
            <CardContent>
              {countries.length !== 0 && (
                <CTable data={countries} cols={columns} />
              )}
            </CardContent>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Home;
