pipeline {

    agent any

    environment {

        DOCKERHUB_USERNAME = 'srushti22'

        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/ai-agent-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/ai-agent-frontend"

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {

            parallel {

                stage('Backend Dependencies') {
                    steps {
                        sh '''
                            cd backend

                            python3 -m venv venv

                            ./venv/bin/pip install \
                              -r requirements.txt
                        '''
                    }
                }

                stage('Frontend Dependencies') {
                    steps {
                        sh '''
                            cd frontend

                            npm ci
                        '''
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {

                withSonarQubeEnv('SonarQube') {

                    script {

                        def scannerHome = tool 'sonar-scanner'
                        withCredentials([
                            string(
                                credentialsId: 'sonarqube-token',
                                variable: 'SONAR_TOKEN'
                            )
                        ]) {

                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=ai-agent-devops \
                              -Dsonar.sources=backend,frontend \
                              -Dsonar.exclusions=**/node_modules/**
                        """
                    }
                }
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {

                sh '''
                    trivy fs \
                      --severity HIGH,CRITICAL \
                      --exit-code 0 \
                      .
                '''
            }
        }

        stage('Build Backend Image') {
            steps {

                sh """
                    docker build \
                      -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                      ./backend
                """
            }
        }

        stage('Build Frontend Image') {
            steps {

                sh """
                    docker build \
                      -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                      ./frontend
                """
            }
        }

        stage('Trivy Backend Image Scan') {
            steps {

                sh """
                    trivy image \
                      --severity HIGH,CRITICAL \
                      --exit-code 0 \
                      ${BACKEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Trivy Frontend Image Scan') {
            steps {

                sh """
                    trivy image \
                      --severity HIGH,CRITICAL \
                      --exit-code 0 \
                      ${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" |
                        docker login \
                          -u "$DOCKER_USER" \
                          --password-stdin
                    '''

                    sh """
                        docker push \
                          ${BACKEND_IMAGE}:${IMAGE_TAG}
                    """

                    sh """
                        docker push \
                          ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {

                sh '''
                    kubectl apply -f k8s/namespace.yaml
                    kubectl apply -f k8s/postgres.yaml
                    kubectl apply -f k8s/backend.yaml
                    kubectl apply -f k8s/frontend.yaml
                    kubectl apply -f k8s/ingress.yaml
                '''

                sh """
                    kubectl set image deployment/employee-backend \
                      backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                      -n ai-agent
                """

                sh """
                    kubectl set image deployment/ai-agent-frontend \
                      frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                      -n ai-agent
                """
            }
        }
    }

    post {

        success {
            echo '''
            ========================================
            CI/CD PIPELINE SUCCESSFUL
            ========================================
            '''
        }

        failure {
            echo '''
            ========================================
            CI/CD PIPELINE FAILED
            ========================================
            '''
        }
    }
}
