#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

log "Running deployment script diagnostics..."

# 1. Check & Install Docker
if ! command -v docker &> /dev/null; then
    warn "Docker not found. Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    log "Docker installed successfully."
else
    log "Docker is installed."
fi

# 2. Check & Install AWS CLI
if ! command -v aws &> /dev/null; then
    warn "AWS CLI not found. Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -o awscliv2.zip
    sudo ./aws/install
    rm awscliv2.zip
    rm -rf aws
    log "AWS CLI installed successfully."
else
    log "AWS CLI is installed."
fi

# 3. Configure AWS
log "Checking AWS configuration..."
if [ ! -d "$HOME/.aws" ] || [ ! -f "$HOME/.aws/credentials" ]; then
    warn "AWS credentials not found. Please configure them now."
    aws configure
else
    log "AWS credentials found."
fi

# Fix: Ensure Region is set
REGION=$(aws configure get region || echo "")
if [ -z "$REGION" ]; then
    warn "AWS region is not configured. Setting default to 'us-east-1'."
    aws configure set region us-east-1
    REGION="us-east-1"
fi

# 4. Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$ACCOUNT_ID" ]; then
    error "Failed to get AWS Account ID. Please check your credentials."
fi

REPO_NAME="kirata-backend"
IMAGE_TAG="latest"
ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME"

log "Deploying with Account ID: $ACCOUNT_ID in Region: $REGION"

# 5. Create ECR Repository if it doesn't exist
log "Checking ECR repository '$REPO_NAME'..."
if ! aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" &> /dev/null; then
    log "Creating ECR repository '$REPO_NAME'..."
    aws ecr create-repository --repository-name "$REPO_NAME" --region "$REGION"
else
    log "ECR repository '$REPO_NAME' already exists."
fi

# 6. Authenticate Docker with ECR
log "Authenticating Docker with ECR..."
aws ecr get-login-password --region "$REGION" | sudo docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# 7. Build and Push Image
log "Building Docker image..."
sudo docker build -t "$REPO_NAME" .

log "Tagging image..."
sudo docker tag "$REPO_NAME:$IMAGE_TAG" "$ECR_URI:$IMAGE_TAG"

log "Pushing image to ECR..."
sudo docker push "$ECR_URI:$IMAGE_TAG"

log "✅ Backend image pushed successfully to: $ECR_URI:$IMAGE_TAG"

# 8. App Runner Creation Instruction
echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}       DEPLOYMENT IMAGE READY         ${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "The backend image has been pushed to ECR."
echo -e "To create the App Runner service, run the following command:"
echo
echo -e "${YELLOW}aws apprunner create-service \\"
echo -e "  --service-name kirata \\"
echo -e "  --source-configuration '{\"AuthenticationConfiguration\": {\"AccessRoleArn\": \"<YOUR_ACCESS_ROLE_ARN>\"}, \"ImageRepository\": {\"ImageIdentifier\": \"$ECR_URI:$IMAGE_TAG\", \"ImageConfiguration\": {\"Port\": \"3000\"}, \"ImageRepositoryType\": \"ECR\"}}'${NC}"
echo
echo -e "Alternatively, you can go to the AWS Console -> App Runner -> Create Service"
echo -e "and select the image URI: ${YELLOW}$ECR_URI:$IMAGE_TAG${NC}"
