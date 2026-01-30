pipeline {
    agent any

    environment {
        // Docker Hub credentials stored in Jenkins
        DOCKER_CREDENTIALS_ID = 'dockerhub'
        FRONTEND_IMAGE = "dulanjaf/frontend-app"
        BACKEND_IMAGE = "dulanjaf/backend-app"

        // Git repository URL
        GIT_REPO = "https://github.com/dulanjaf/devops.git"

        // AWS credentials for Terraform
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh "docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile frontend"
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile backend"
            }
        }

        stage('Push Docker Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS_ID}", 
                    usernameVariable: 'DOCKER_USER', 
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${FRONTEND_IMAGE}:latest
                        docker push ${BACKEND_IMAGE}:latest
                    '''
                }
            }
        }

        /* ================= CD PART: Deploy with Terraform ================= */

        stage('Terraform Init') {
            steps {
                sh '''
                    cd terraform_devops/terraform-ec2
                    terraform init
                '''
            }
        }

        stage('Terraform Apply (Deploy to AWS)') {
            steps {
                sh '''
                    cd terraform_devops/terraform-ec2
                    terraform apply -auto-approve
                '''
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
    }
}
