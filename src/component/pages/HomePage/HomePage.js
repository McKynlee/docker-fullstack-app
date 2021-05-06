import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import {
    Grid,
    Typography,
} from '@material-ui/core';
import FruitStand from '../../FruitStand/FruitStand';
import EmployeesList from '../../EmployeesList/EmployeesList';

class HomePage extends Component {
    onNavToGetStarted = (event) => {
        window.open('https://www.docker.com/get-started', '_blank');
    }

    render() {
        return (
            <div>
                <img src="/images/docker-splash-2.jpg" alt="Docker Whale Being Loaded With Containers" />

                <div className="pgContainer">
                    <div className="vr vr_x3">
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={9}>
                                <FruitStand />
                            </Grid>
                            <Grid item xs={3}>
                                <Typography gutterBottom variant="h5" component="h3">
                                    Fruit Stand
                                </Typography>

                                <p>A generated fruit stand with a selection of fruit for a person to pick out their favorite fruits.</p>
                            </Grid>
                        </Grid>
                    </div>

                    <div className="vr vr_x3">
                        <Grid container spacing={3} justify="center">
                            <Grid item xs={3}>
                                <Typography gutterBottom variant="h5" component="h3">
                                    Employees
                                </Typography>

                                <p>Showing a list of employee information that is being stored in a persistent database.</p>
                            </Grid>
                            <Grid item xs={9}>
                                <EmployeesList />
                            </Grid>
                        </Grid>
                    </div>
                    <div className="pageTitle">
                        <h2>Welcome to Dockerization</h2>
                    </div>

                    <p>Get started by <a href="https://www.docker.com/get-started" target="_blank" rel="noopener noreferrer">downloading Docker</a>. You will be prompted to signup for a free account in order to download the desktop app.</p>

                    <Button
                        onClick={this.onNavToGetStarted}
                        variant="contained"
                        color="primary"
                    >
                            Get Started
                    </Button>
                </div>
            </div>
        );
    }
}

export default HomePage;
