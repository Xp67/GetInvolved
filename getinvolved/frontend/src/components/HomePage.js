import React, { Component } from "react";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import { link, Navigate } from "react-router-dom";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";



export default class HomePage extends Component {

 constructor(props) {
  super(props);
  }



  render() {
    return (
       <Grid container spacing={1}> 
        <Grid size={{ xs:12, align:"center" }}>
          <Typography component={"h4"} variant="h4">
            Join the Party!
          </Typography>
        </Grid>
        <Grid size={{ xs:12, align:"center" }}>
          <FormControl component={"fieldset"}>
            <FormHelperText>
              Non so dove sta sta scritta
            </FormHelperText>
            <RadioGroup row defaultValue='true'>
              <FormControlLabel value='true' control={<Radio color="primary" label="Play/Pause" labelplacement="bottom"/>}>

              </FormControlLabel>
              <FormControlLabel value='true' control={<Radio color="secondary" label="No control" labelplacement="bottom"/>}>

              </FormControlLabel>
            </RadioGroup>
          </FormControl>
        </Grid>
       </Grid>
    )
  }
}





