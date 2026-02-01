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
                    url: GIT_REPO,
                    credentialsId: 'github-token'
            }
        }

        stage('Terraform Init') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    dir('terraform-ec2') {
                        sh 'terraform init'
                    }
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    dir('terraform-ec2') {
                        sh 'terraform plan'
                    }
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    dir('terraform-ec2') {
                        sh 'terraform apply -auto-approve'
                    }
                }
            }
        }

        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }
    }
}
