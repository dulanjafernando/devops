pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub'
        FRONTEND_IMAGE = "dulanjah/frontend-app"
        BACKEND_IMAGE = "dulanjah/backend-app"
        GIT_REPO = "https://github.com/dulanjafernando/devops.git"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: "${GIT_REPO}",
                    credentialsId: 'github-token'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                        docker build -t ${BACKEND_IMAGE}:latest .
                        docker tag ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh '''
                        docker build -t ${FRONTEND_IMAGE}:latest .
                        docker tag ${FRONTEND_IMAGE}:latest ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully"
        }
        failure {
            echo "Pipeline failed – check logs"
        }
    }
}
