# Setup process

## Create a local Jenkins instance

```bash
# use Docker to run a local instance
docker run -p 8080:8080 -p 50000:50000 --restart=on-failure jenkins/jenkins:lts-jdk17

# Get container ID for Jenkins instance
docker ps

# Get an interactive shell into the Jenkins container, get the admin password for the setup process.
docker exec -it <container-id> /bin/bash

cat /var/jenkins_home/secrets/initialAdminPassword
```

Follow the basic setup process:

- install suggested plugins
- create first admin user
- leave instance configuration as is (unless you need port 8080)

### Create a job for the Backstage plugin to retrieve

1. Create a job, stick with Pipeline for now.
2. For the sake of this example, call the New Item "artist-lookup"
3. Scroll down to Pipeline, in the script do something simple like:

```
pipeline {
    agent any

    stages {
        stage('Hello World') {
            steps {
                echo 'Hello, World!'
            }
        }
    }
}
```

4. Save changes

### Create an API key for your user

1. Click your username (Top right)
2. Click Security tab (left side)
3. Click "Add new Token" and generate the token (the name doesn't matter).
4. Save the API key somewhere. It will be used in the Backstage plugin.

## Setup the local Jenkins Backstage instance

### Configure app-config.yaml

in `workspaces/jenkins/app-config.yaml`, add the following lines under `backend`, after `database`:

```yaml
jenkins:
  baseUrl: http://localhost:8080
  username: <username>
  projectCountLimit: 100
  apiKey: <api-key>
```

### Configure entities.yaml

in `workspaces/jenkins/examples/entities.yaml`, for the first `Component` entry, modify it with the following values (or add a new entry):

```yaml
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: <jenkins-job-name>
  annotations:
    jenkins.io/job-full-name: '<jenkins-job-name>' # If the pipeline job is in a folder, you can do 'folder/<jenkins-job-name>'
```

### Remove checks for branches

**NOTE:** This is currently used for testing purposes. This should **not** be needed in the future.

It appears that the plugin expects a Multi-stage pipeline that references some repo branches.
The default repo branches the plugin looks for are `main` or `master`.

Edit the following line in `workspaces/jenkins/packages/app/src/components/catalog/EntityPage.tsx`:

```javascript

// Before
<EntityLatestJenkinsRunCard branch="main,master" variant="gridItem" />

// After
<EntityLatestJenkinsRunCard branch="" variant="gridItem" />
```

## Run the Backstage instance

```bash
yarn run dev
```
