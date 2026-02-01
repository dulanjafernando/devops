pipeline {
    agent any

    environment {
        // Git & Docker
        GIT_REPO = "https://github.com/dulanjafernando/devops.git"
        DOCKER_CREDENTIALS_ID = "dockerhub"
        FRONTEND_IMAGE = "dulanjah/frontend-app"
        BACKEND_IMAGE = "dulanjah/backend-app"

        // AWS credentials for Terraform
        AWS_CREDENTIALS_ID = "aws-credentials"
    }

    stages {

        // 1️⃣ Clone repository
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: GIT_REPO,
                    credentialsId: 'github-token'
            }
        }

        // 2️⃣ Build Backend Docker image
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

        // 3️⃣ Build Frontend Docker image
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

        // 4️⃣ Push Docker images to Docker Hub
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

        // 5️⃣ Terraform Init
        stage('Terraform Init') {
            steps {
                dir('terraform-ec2') {
                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: AWS_CREDENTIALS_ID]
                    ]) {
                        sh 'terraform init'
                    }
                }
            }
        }

        // 6️⃣ Terraform Plan
        stage('Terraform Plan') {
            steps {
                dir('terraform-ec2') {
                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: AWS_CREDENTIALS_ID]
                    ]) {
                        sh 'terraform plan'
                    }
                }
            }
        }

        // 7️⃣ Terraform Apply
        stage('Terraform Apply') {
            steps {
                dir('terraform-ec2') {
                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding', credentialsId: AWS_CREDENTIALS_ID]
                    ]) {
                        sh 'terraform apply -auto-approve'
                    }
                }
            }
        }

        // 8️⃣ Cleanup workspace
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
