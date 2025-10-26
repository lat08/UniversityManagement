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
    NEXT_PUBLIC_API_BASE_URL = 'http://34.142.130.206:5000/edu/api'
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

    stage('Build') {
      steps {
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
                echo "ERROR: nvm initialization script not found in profile files or at fallback path!" >&2
                echo "Please verify nvm installation for the 'jenkins' user (e.g., check $HOME/.bashrc)." >&2
                exit 1
              fi
            else
               echo "--- nvm command found after sourcing profile files ---"
            fi

            echo "--- Node & npm ---"
            # Explicitly use the default nvm version (good practice)
            nvm use default
            node --version
            npm --version

            echo "--- npm install ---"
            npm ci || npm install

            echo "--- Building Next.js app with env ---"
            export NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL"
            echo "NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL"
            npm run build
        '''
      }
      post {
        success {
          archiveArtifacts artifacts: '.next/**, public/**, package.json, package-lock.json, next.config.js', fingerprint: true
        }
      }
    }

    stage('Deploy') {
      steps {
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
          NVM_NPM_PATH=$(sudo -u jenkins -i which npm)
            if [ -z "$NVM_NPM_PATH" ]; then
              echo "ERROR: Could not find npm path for jenkins user!" >&2
              exit 1
            fi
            echo "Using npm path: $NVM_NPM_PATH"

            sudo tee /etc/systemd/system/$SERVICE > /dev/null <<EOF
[Unit]
Description=UniversityManagement Frontend (Next.js)
After=network.target

[Service]
WorkingDirectory=$DEPLOY_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
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
}

