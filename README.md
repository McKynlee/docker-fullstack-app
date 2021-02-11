# Dockerizing a Full Stack Application

If we have a fullstack application we can no longer run Docker using a single container. We will need to configure and run many containers that will need to be able to communicate with one another.


## Installing Docker (MUST have Docker installed)

1. Navigate to the [Docker Get Started](https://www.docker.com/get-started) page.
1. Click on the **Download Desktop and Take a Tutorial** button on the right side of the page.
1. Create an account with Docker Hub.
    - The Docker ID is the username that docker will use to identify you.
    - Complete Profile...
    - Confirmation email...
1. Downloading the Docker desktop application in the BG.


## Adding Docker Compose

We had to add a lot of additional settings to the **Docker** commands to get it to work the way we wanted to. With a multiple container setup we can re-purpose these additional command flags as configuration settings in a new **Docker** configuration file. This configuration file can hold these custom settings along with eventually letting us run and configure many different **Docker Containers**.

### File Structure

Before we dive into things let's take a look at what is different in our project file structure first. We can see the `/src` and `/public` directories for our client-side code in their place like we're used to. There is even a `/sever` directory for our server-side (Back-End) code as we have had previously. What happened to our `database.sql` file though?

#### Database Files

You might notice that the `database.sql` file seems to be missing from the root of our project. The database queries have been moved inside of a new `/database` directory. In the `/database` directory we have two separate SQL files. There is the `init.sql` file and the `data.sql` file. Let's take a look at the `init.sql` file first.

`/database/init.sql` - All of the `CREATE TABLE` queries will go in this file.
`/database/data.sql` - All of the `INSERT` queries for populating the tables will go in this file.

These two SQL files are separated into `CREATE TABLE` and `INSERT` queries to ensure that they get run in a specific order. Now that we are working with docker we can configure Docker to run these files for us in order to setup the Database for our project.

#### Docker Configuration Files

The other new files that you'll notice at the root of the project are 3 Docker configuration files. These are the `Dockerfile.client`, `Dockerfile.server`, & `docker-compose.yml` files. Before we dive into each of these files let's talk a little bit about why they are here.

- In the `Dockerfile.client` we setup all of the configuration settings specific to the Docker image for the client-side environment.
- In the `Dockerfile.server` we setup all of the configuration settings specific to the Docker image for the server-side environment.
- In the `docker-compose.yml` we configure all three of our Docker container that will be needed to run our fullstack application; the client, server, and database.

The first file we're going to dive into is the `docker-compose.yml` file that ties everything together.

### Docker Compose Overview

1. We're gonna take a look at a new kind of file called a YAML file. The important thing to keep in mind with YAML files is that **indentation** is **extremely important**.
1. Take note of a new file at the root of our project called the `docker-compose.yml`. This particular file must absolutely be named `docker-compose.yml` for the Docker CLI to recognize it.
1. Inside of the `docker-compose.yml` file you'll notice 2 major sections at the first indentation level. One is `version:` and the other is `services:`.
    - `version:` - Version defines the version of the docker compose configurations we are using. In this cas we are working with version # 3.
    - `services:` - Services is where we define and configure each of the containers we want to work with. This is where the majority of our configuration goes.
1. The next level of indentation in from the `services:` is where we define our different containers giving them names to be able to reference them. Each container represents a different environment. The key here is that each must be only one indentation in from `services:`.

    ```yml
    services:
      # client-side application environment
      client:
      # database environment
      database:
      # server-side application environment
      server:
    ```


### Client Container, Docker Compose Configuration

1. The configuration settings in the `docker-compose.yml` file are as follows:

    ```yml
    version: '3'

    services:
      ##
      ## CONTAINER for Client Side Application
      ## to test service run:
      ##     docker-compose up --build -d client
      ## ----------------------------------------
      client:
        stdin_open: true
        build:
          context: ./
          dockerfile: ./Dockerfile.client
        ports:
          - 3000:3000 # expose ports - HOST:CONTAINER (for create-react-app)
          - 35729:35729 # expose ports - HOST:CONTAINER (for serviceworker warm reloading)
        volumes:
          - './client:/app/client'
          - '/app/client/node_modules'
        depends_on:
          - server
        command: npm run client
    ```

*Let's breakdown what the Yaml configuration settings are for the "**client**" container.*

**`client:` container configuration**

1. `stdin_open: true` - is needed to allow the react application to use the warm reload when saving changes
1. `build:` - allows us to set custom build settings for this particular container
    - `context:` - sets the build context and if Docker configuration file is not set to a specific file it will look for a `Dockerfile` existing in the root of the directory defined in the context
    - `dockerfile:` - give the path to the Docker configuration file that we are using for the client container, we'll come back to talk about the `Dockerfile.client`
1. `ports:` - here we define the various ports that we want exposed from our container to our host
    - `- HOST:CONTAINER` - the `HOST` port is the port that will be available on your computer @ `http://localhost:HOST` and `CONTAINER` represents that port that is being exposed inside the **Docker Container**
    - this setting replaces the `-p 3001:3000 -p 35729:35729` options that were added to the `docker run` command we used previously
1. `volumes:` - mounts host paths or named volumes, specified as sub-options to a service.
    - this setting replaces the `-v $(pwd):/app` option that were added to the `docker run` command we used previously
    - `- ./[LOCAL_DIRECTORY]:/[CONTAINER_DIRECTORY]`, first we define the local directory where we might be making file changes and then we define the location inside of the container to associate those changes to. The local and container directory paths **must be** separated by a `:` for this to process correctly
    - `- './src:/app/client/src'`, helps watch for changes inside of the `/src` directory
    - `- './public:/app/client/public'`, helps watch for changes inside of the `/public` directory
    - `- '/app/client/node_modules'`, helps watch for changes to `/node_modules`
1. `depends_on:` - allows us to define the various other containers that this **client** container depends on in order to run
1. `command:` - this should be the run command needed to start the application and it will override the `CMD` set in the `Dockerfile`
    - `npm run client` - it will run the `npm run client` command that we give it in the terminal inside of the **client** container

**QUESTIONS???**

For..

```yml
client:
  stdin_open: true
  build:
    context: ./
    dockerfile: ./Dockerfile.client
```

We quickly mentioned the `Dockerfile.client` that was being used to configure the client-side image for the environment. Let's take a minute to look at that file.

#### Dockerfile for Client Container

Normally the configuration for the Docker image is setup in a file just named `Dockerfile`. We have added the `.client` to `Dockerfile` because we were going to have multiple files for different containers and this is being use to separate them. The addition of `.client` only means something to us and doesn't mean anything to Docker.

1. In order to set the base environment configuration for the client-side application container we we use an existing image from the [Docker Hub](https://hub.docker.com) using the `FROM` setting in the `Dockerfile.client`. In this case we are setting up a node environment to run `react-scripts` from `create-react-app` and install dependencies.

    ```
    # Base image we are modifying from https://hub.docker.com/
    FROM node:14.15.4-alpine3.10
    ```

1. Makes a new directory and set it as the working directory for the Docker image. Once the working directory is set we can run command from inside the container in that directory.

    ```
    # Set working directory
    RUN mkdir -p /app/client
    WORKDIR /app/client
    ```

1. Copy over the existing `package.json` to the new working directory and install the application dependencies using `npm install`.

    ```
    # install and cache app dependencies
    COPY ./package.json /app/client/package.json
    RUN npm install
    ```

1. After dependency installation copy over all assets to the working directory.

    ```
    COPY . /app/client
    ```

1. Ensure that the default `create-react-app` port is exposed to the network created by Docker. Port 3000 is the port that `react-scripts` defaults to in order to run the react application and the 35729 port is the port used for warm reloading in `react-scripts`.

    ```
    # Exposing a specific PORT for viewing the application
    EXPOSE 3000
    EXPOSE 35729
    ```

1. Define the final command(s) that need to be run to kick off the application when the container launches.

    ```
    # Run final command to kick off client build
    CMD ["npm", "run", "client"]
    ```

### Database Container, Docker Compose Configuration

1. create a `database` directory in the root of the project folder
1. create an `init.sql` file inside of the `database` directory
    - this file will contain all of our queries for our database tables
1. create a `data.sql` file inside of the `database` directory
    - this file will be used to seed some initial data into our tables for local development

Before we used these types of files to make it easier for other people setup the local environment for our application but now we can use it to actually setup and run our database. Now let's configure **Docker Compose** with a new container to handle our database.

1. If we take a look at the **database** container in the `docker-compose.yml` file we can examine the configuration for the **database** container environment. This one is gonna look quite a bit different from the **client** container.

    ```yml
    services:
        ## ... CLIENT CONTAINER SETTINGS ...

        ##
        ## CONTAINER for Postgres database
        ## database access URL:
        ##     postgres://POSTGRES_USER:POSTGRES_PASSWORD@localhost:HOST_PORT/POSTGRES_DB
        ## to test service run:
        ##     docker-compose up --build -d database
        ## ----------------------------------------
        database:
            image: postgres:latest
            restart: always
            ports:
                - 54320:5432
            environment:
                POSTGRES_USER: dockerpguser
                POSTGRES_PASSWORD: linkAwake342
                POSTGRES_DB: employee_portal
                POSTGRES_HOST: localhost
            volumes:
                - ./database/init.sql:/docker-entrypoint-initdb.d/10-init.sql
                - ./database/data.sql:/docker-entrypoint-initdb.d/20-data.sql
    ```

*Let's breakdown what the Yaml configuration settings are for the "**database**" container.*

**`database:` container configuration**

1. `image` - inside of the `Dockerfile` we used for the `client` container we defined a base image using `FROM` this is the `docker-compose.yml` equivalent of that so in this case our base image is `postgres:latest`
1. `restart` - we are telling to always restart the database when inactive
1. `ports` - we are exposing the Docker container postgres port that is be default `5432` to our **HOST** machine on port `54320` so as not to conflict with any other postgres database we may have running (`HOST:CONTAINER`)
1. `environment` - just like you have seen us set up environment variables on a `.env` file locally we can set some environment configuration variables for the **Docker Container**, the majority of the environment configurations are things that our base image leverages in order to spin up postgres
    - `POSTGRES_USER` - this is the database username used to access the database
    - `POSTGRES_PASSWORD` - this is the password associated with the provided username
    - `POSTGRES_DB` - this is the name of the postgres database
    - `POSTGRES_HOST` - this is the base host location `localhost` where Postico will access the database
1. `volumes` - we have seen this use in out `client` container but the way in which we are using it here is very different because it's actually running our SQL files for us in order to setup our tables/schema and seed some data inside of there
    - `[PATH_TO_SQL]:/docker-entrypoint-initdb.d/[SQL_FILE_NAME].sql` - in the first part you should put the path to the `.sql` file in your codebase relative to the `docker-compose.yml` file and in the second part you are going to use a very specific naming structure to rename the file that you are pointing to in your project directory where you start with a number `10-` and then use the same name as your origin file for the second part `init.spl`
        - The numbers being used are the key here because that helps us to run the SQL files in a specific order


#### Server Container

Now that we have the `client` environment and `database` setup and working in our `docker-compose.yml` let's take a look at setting up the server.

### Running Multiple Containers

The biggest benefit to using the `docker-compose.yml` is that we can now run multiple containers from the one **Docker Image** allowing us to spin up an entire full stack application. Where as before we had to run `create db`, several SQL queries, `npm instal`, `npm run server`, & `npm run client` in order to spin up our application and develop locally with **Docker Compose** we just run `docker-compose up` and it's all taken care of.

Now that we have our configurations setup let's go ahead and build out our new environment with both the client and database running. We'll want to make sure to first remove any previous **Docker Images** we may have had running and then spin up our new **Docker Containers**.

1. run: `docker-compose images`
1. may see some images that have been created listed out in the console

    ```
           Container                Repository         Tag       Image Id      Size
    --------------------------------------------------------------------------------
    dockerize-app_client_1     dockerize-app_client   latest   ca3551b22fa3   407 MB
    ```

1. run: `docker-compose stop`
    - ensures that all the images have stopped
1. run: `docker-compose rm`
    - removes all of the stopped images and you can verify by running `docker-compose images` again
1. run: `docker-compose up`
    - this will load and build all of our images and then run our containers
1. Make sure that our `client` environment is still working by navigating to **http://localhost:3001** in your browser.
1. Now we can take a look at the database using **Postico** because we have exposed those ports.
1. Open **Postico** and make sure you are looking at your favorites window.
1. Click **Edit** on one of your favorites or add a **New Favorite**
1. **Nickname** - call it "Docker"
1. **Host** - use "localhost" (same value we used for `POSTGRES_HOST`)
1. **User** - use "dockerpguser" (same value used for `POSTGRES_USER`)
1. **Password** - use "linkAwake342" (same the value used for `POSTGRES_PASSWORD`)
1. **Database** - use "employee_portal" (same the value used for `POSTGRES_DB`)
1. Click **Connect** and then Postico will open up a view of the database and you'll se that not only did it create our **"employees"** table for us but it also populated some initial data for us as well based on the queries in our SQL files



### Docker Compose Commands

[Docker Compose Commands](https://docs.docker.com/compose/reference/)

1. In order to standup our new setup run: `docker-compose up`
    - Builds, (re)creates, starts, and attaches to containers for a service. Unless they are already running, this command also starts any linked services.
    - Running `docker-compose up -d` starts the containers in the background and leaves them running.
1. In order to view the containers run: `docker-compose images`
    - List images used by the created containers.


#### Docker Command Cheat Sheet

```
## List Docker CLI commands
docker
docker container --help

## Display Docker version and info
docker --version
docker version
docker info

## Execute Docker image
docker run hello-world

## List Docker images
docker image ls

## List Docker containers (running, all, all in quiet mode)
docker container ls
docker container ls --all
docker container ls -aq

## Remove image by ID
docker image rm [ID]
## Remove all stopped images
docker image prune

## Remove all stopped containers:
## pass the `--volumes` tag if you want all volumes to be removed as well
docker system prune

## Remove container by ID:
docker container rm [ID]

```

## Dependencies

- [Create React App](https://github.com/facebook/create-react-app)
- react
- redux
- redux saga
- node.js
- express
- postgresql
