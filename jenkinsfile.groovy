pipeline {
    agent any

    environment {
        GIT_REPO = "https://github.com/dulanjafernando/devops.git"
        DOCKER_CREDENTIALS_ID = "dockerhub"
        FRONTEND_IMAGE = "dulanjah/frontend-app"
        BACKEND_IMAGE = "dulanjah/backend-app"
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
                dir('terraform-ec2') {
                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: 'aws-credentials']
                    ]) {
                        sh 'terraform init'
                    }
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform-ec2') {
                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: 'aws-credentials']
                    ]) {
                        sh 'terraform plan'
                    }
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform-ec2') {
                    withCredentials([
                        [$class: 'AmazonWebServicesCredentialsBinding',
                         credentialsId: 'aws-credentials']
                    ]) {
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

    post {
        success {
            echo '✅ Pipeline completed successfully'
        }
        failure {
            echo '❌ Pipeline failed – check logs above'
        }
    }
}
