pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub'
        FRONTEND_IMAGE = "dulanjah/frontend-app"
        BACKEND_IMAGE = "dulanjah/backend-app"
        GIT_REPO = "https://github.com/dulanjafernando/devops.git"

        // AWS credentials for Terraform
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: GIT_REPO,
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

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: DOCKER_CREDENTIALS_ID,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                        docker logout
                    '''
                }
            }
        }

        stage('Terraform Init') {
            steps {
                dir('terraform-ec2') {
                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform-ec2') {
                    sh 'terraform plan'
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform-ec2') {
                    sh 'terraform apply -auto-approve'
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
            echo "✅ Pipeline completed successfully"
        }
        failure {
            echo "❌ Pipeline failed – check logs above"
        }
    }
}
