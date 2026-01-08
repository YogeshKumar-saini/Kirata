#!/bin/bash
set -e

# Disable AWS CLI pager
export AWS_PAGER=""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Configuration
ROLE_NAME="AppRunnerECRAccessRole"
SERVICE_NAME="kirata-backend"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$SERVICE_NAME:latest"

log "Starting App Runner Service deployment..."
log "Image URI: $IMAGE_URI"

# 1. Create Trust Policy
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Create IAM Role
log "Creating IAM Role '$ROLE_NAME'..."
if aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
    log "Role '$ROLE_NAME' already exists."
else
    aws iam create-role --role-name "$ROLE_NAME" --assume-role-policy-document file://trust-policy.json
    log "Role '$ROLE_NAME' created."
fi

# 3. Attach Policy
log "Attaching AWSAppRunnerServicePolicyForECRAccess policy..."
aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"

# Clean up policy file
rm trust-policy.json

# Get Role ARN
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query Role.Arn --output text)
log "Role ARN: $ROLE_ARN"

# Wait for role propagation
log "Waiting 10 seconds for role propagation..."
sleep 10

# 4. Create App Runner Service
log "Creating App Runner Service '$SERVICE_NAME'..."

aws apprunner create-service \
    --service-name "$SERVICE_NAME" \
    --source-configuration '{
        "AuthenticationConfiguration": {
            "AccessRoleArn": "'"$ROLE_ARN"'"
        },
        "ImageRepository": {
            "ImageIdentifier": "'"$IMAGE_URI"'",
            "ImageConfiguration": {
                "Port": "3000",
                "RuntimeEnvironmentVariables": {
                    "NODE_ENV": "production",
                    "PORT": "3000"
                }
            },
            "ImageRepositoryType": "ECR"
        }
    }' \
    --region "$REGION"

log "✅ App Runner Service creation initiated successfully!"
log "Visit the AWS Console to view your service status: https://$REGION.console.aws.amazon.com/apprunner/home?region=$REGION#/services"
