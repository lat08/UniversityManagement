pipeline {
    agent { label 'github-server' } 

    options { 
        skipStagesAfterUnstable()
        skipDefaultCheckout(true)
        timestamps()
    }

    environment { 
        DEPLOY_DIR   = '/data/um/UniversityManagement/frontend'
        PORT         = '5001'
        SERVICE      = 'um-frontend.service'
        BACKEND_PORT = '5000'
        NEXT_TELEMETRY_DISABLED = '1'
        NEXT_PUBLIC_API_BASE_URL = 'https://api.acdm.site/edu/api'
        
        NEXT_PUBLIC_SUPABASE_URL = 'https://baygtczqmdoolsvkxgpr.supabase.co'
    }

    stages {
        stage('Git safe.directory') { 
            steps {
                sh '''#!/usr/bin/env bash
                    set -euxo pipefail
                    git config --global --add safe.directory "$WORKSPACE" || true
                ''' 
            }
        }

        stage('Checkout') { 
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/develop']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/lat08/UniversityManagement.git',
                        credentialsId: 'jenkins-github-user'
                    ]]
                ]) 
            }
        }

        stage('Build & SonarQube Analysis') {
            steps {
                withCredentials([
                    string(credentialsId: 'SONAR_TOKEN_FE', variable: 'SONAR_TOKEN_LOGIN'),
                    string(credentialsId: 'SUPABASE-ANON-KEY', variable: 'SUPABASE_KEY_SECRET'),
                    string(credentialsId: 'RECAPTCHA-SITE-KEY', variable: 'RECAPTCHA_SITE_KEY_SECRET')
                ]) {
                    sh '''#!/usr/bin/env bash
                        set -euxo pipefail

                        echo "--- Attempting to source nvm from profile files ---"
                        [ -s "$HOME/.profile" ] && . "$HOME/.profile"
                        [ -s "$HOME/.bashrc" ] && . "$HOME/.bashrc"
                        [ -s "$HOME/.bash_profile" ] && . "$HOME/.bash_profile"
                        if ! command -v nvm &> /dev/null; then
                            echo "--- nvm command still not found, trying explicit path (as fallback) ---"
                            NVM_DIR="/var/lib/jenkins/.nvm"
                            if [ -s "$NVM_DIR/nvm.sh" ]; then
                                echo "--- Sourcing nvm from fallback path $NVM_DIR/nvm.sh ---"
                                . "$NVM_DIR/nvm.sh"
                            else
                                echo "ERROR: nvm initialization script not found!" >&2
                                exit 1
                            fi
                        else
                            echo "--- nvm command found after sourcing profile files ---"
                        fi
                        echo "--- Node & npm ---"
                        nvm use default
                        node --version
                        npm --version

                        echo "--- npm install ---"
                        npm ci || npm install

                        echo "--- Installing/Updating SonarScanner (npm) ---"
                        npm install -g sonar-scanner

                        echo "--- Running SonarQube Analysis ---"
                        export SONAR_TOKEN="$SONAR_TOKEN_LOGIN"
                        
                        sonar-scanner \
                            -Dsonar.projectKey=edu-management-fe \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://136.110.20.54:9000 \
                            -Dsonar.login="$SONAR_TOKEN" \
                            -Dsonar.exclusions=**/.next/**,**/node_modules/**,**/coverage/** \
                            -Dsonar.sourceEncoding=UTF-8
                        
                        echo "--- Building Next.js app with env ---"
                        export NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL"
                        
                        export NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
                        export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_KEY_SECRET"
                        export NEXT_PUBLIC_RECAPTCHA_SITE_KEY="$RECAPTCHA_SITE_KEY_SECRET"
                        
                        echo "NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL"
                        echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL"
                        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=... (secret)"
                        
                        npm run build
                    ''' 
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: '.next/**, public/**, package.json, package-lock.json, next.config.js', fingerprint: true
                } 
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'SUPABASE-ANON-KEY', variable: 'SUPABASE_KEY_SECRET'),
                    string(credentialsId: 'RECAPTCHA-SITE-KEY', variable: 'RECAPTCHA_SITE_KEY_SECRET')
                ]) {
                    sh '''#!/usr/bin/env bash
                        set -euxo pipefail

                        echo "WORKSPACE: $WORKSPACE"
                        echo "DEPLOY_DIR: $DEPLOY_DIR"

                        if [[ -z "$DEPLOY_DIR" || "$DEPLOY_DIR" == "/" ]]; then
                            echo "Invalid DEPLOY_DIR: '$DEPLOY_DIR'" >&2
                            exit 1
                        fi

                        sudo mkdir -p "$DEPLOY_DIR"
                        sudo rm -rf -- "$DEPLOY_DIR"/*

                        echo "--- Copying build artifacts ---"
                        sudo cp -a "$WORKSPACE/.next" "$DEPLOY_DIR/"
                        sudo cp -a "$WORKSPACE/public" "$DEPLOY_DIR/" || true
                        sudo cp -a "$WORKSPACE/package.json" "$DEPLOY_DIR/"
                        sudo cp -a "$WORKSPACE/package-lock.json" "$DEPLOY_DIR/" || true
                        if [[ -f "$WORKSPACE/next.config.js" ]]; then
                            sudo cp -a "$WORKSPACE/next.config.js" "$DEPLOY_DIR/"
                        fi

                        sudo chown -R jenkins:jenkins "$DEPLOY_DIR"

                        echo "--- Installing production dependencies ---"
                        sudo -u jenkins bash -c "source ~/.bashrc && cd '$DEPLOY_DIR' && (npm ci --omit=dev || npm install --production --omit=dev)"

                        echo "--- Creating systemd service file ---"
                        NVM_NPM_PATH=$(sudo -u jenkins bash -c 'source ~/.bashrc && which npm')
                        if [ -z "$NVM_NPM_PATH" ]; then
                            echo "ERROR: Could not find npm path for jenkins user!" >&2; exit 1
                        fi
                        echo "Using npm path: $NVM_NPM_PATH"

                        NODE_BIN_DIR=$(dirname "$NVM_NPM_PATH")
                        if [ -z "$NODE_BIN_DIR" ]; then
                            echo "ERROR: Could not determine Node bin directory!" >&2; exit 1
                        fi
                        echo "Using Node bin directory: $NODE_BIN_DIR"

                        sudo tee /etc/systemd/system/$SERVICE > /dev/null <<EOF
[Unit]
Description=UniversityManagement Frontend (Next.js)
After=network.target

[Service]
WorkingDirectory=$DEPLOY_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT

Environment=NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED
Environment=NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
Environment=BACKEND_PORT=$BACKEND_PORT
Environment=NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
Environment=NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY_SECRET
Environment=NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$RECAPTCHA_SITE_KEY_SECRET

Environment="PATH=${NODE_BIN_DIR}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
User=jenkins
Group=jenkins
ExecStart=$NVM_NPM_PATH start
Restart=always
RestartSec=5
SyslogIdentifier=um-frontend

[Install]
WantedBy=multi-user.target
EOF

                        sudo systemctl daemon-reload
                        sudo systemctl enable "$SERVICE"
                        sudo systemctl restart "$SERVICE"

                        echo "==== SERVICE STATUS ===="
                        sudo systemctl --no-pager -l status "$SERVICE" || true

                        echo "==== WAITING PORT (max 30s) ===="
                        for i in {1..30}; do
                            if sudo ss -ltn | grep -q ":$PORT"; then
                                echo "Port $PORT is listening."
                                sudo ss -ltn | grep ":$PORT" || true
                                break
                            fi
                            if [[ "$i" -eq 30 ]]; then
                                echo "ERROR: Port $PORT not up after 30s!" >&2
                                sudo journalctl -u "$SERVICE" -n 100 --no-pager || true
                                exit 1
                            fi
                            sleep 1
                        done

                        echo "==== LAST 80 LOGS ===="
                        sudo journalctl -u "$SERVICE" -n 80 --no-pager || true
                    '''
                }
            }
        }
        stage('Deploy to Load Balancing') {
            steps {
                sh '''#!/usr/bin/env bash
                    set -euxo pipefail

                    INSTANCE_HOST="um@34.142.130.206"
                    INSTANCE_DEPLOY_DIR="/data/um/UniversityManagement/frontend"

                    echo "--- Create deploy dir on instance (if not exists) ---"
                    ssh "$INSTANCE_HOST" "mkdir -p '$INSTANCE_DEPLOY_DIR'"

                    echo "--- Rsync from github-server DEPLOY_DIR to instance ---"
                    rsync -az --delete "$DEPLOY_DIR"/ "$INSTANCE_HOST":"$INSTANCE_DEPLOY_DIR"/

                    echo "--- Restart um-frontend.service on instance ---"
                    ssh "$INSTANCE_HOST" "sudo systemctl daemon-reload || true"
                    ssh "$INSTANCE_HOST" "sudo systemctl restart um-frontend.service"

                    echo "--- Instance service status ---"
                    ssh "$INSTANCE_HOST" "sudo systemctl --no-pager -l status um-frontend.service || true"
                '''
            }
        }
    }
}



