#!/bin/bash

# Variables (can be overridden by environment variables)
SERVICE_NAME="${SERVICE_NAME:-oauth-server-service}"    # Default to "oauth-server-service"
SERVICE_NAMESPACE="${SERVICE_NAMESPACE:-default}"       # Default to "default" namespace
RETRIES="${RETRIES:-10}"                                # Default to 10 retries
SLEEP_INTERVAL="${SLEEP_INTERVAL:-30}"                  # Default sleep interval of 30 seconds

# Check if kubectl is installed and available
if ! command -v kubectl &>/dev/null; then
  echo "Error: kubectl is not installed or not in PATH."
  exit 2
fi

# Verify that the user is authenticated to a Kubernetes cluster
if ! kubectl cluster-info &>/dev/null; then
  echo "Error: Unable to connect to the Kubernetes cluster. Ensure you are authenticated."
  exit 3
fi

# Check if the service exists and is of type LoadBalancer
SERVICE_TYPE=$(kubectl get svc "$SERVICE_NAME" -n "$SERVICE_NAMESPACE" -o jsonpath='{.spec.type}' 2>/dev/null)

if [ "$SERVICE_TYPE" != "LoadBalancer" ]; then
  echo "Error: Service $SERVICE_NAME is not of type LoadBalancer or does not exist."
  exit 4
fi

# Wait for LoadBalancer hostname to become available
echo "Waiting for LoadBalancer hostname for service '$SERVICE_NAME' in namespace '$SERVICE_NAMESPACE'..."
for ((i=1; i<=RETRIES; i++)); do
  LB_HOST=$(kubectl get svc "$SERVICE_NAME" -n "$SERVICE_NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)

  if [ -n "$LB_HOST" ]; then
    echo "LoadBalancer Host found: $LB_HOST"
    echo "Checking HTTP response from https://$LB_HOST (accepting self-signed certificates)..."

    for ((j=1; j<=RETRIES; j++)); do
      HTTP_STATUS=$(curl -k -s -o /dev/null -w '%{http_code}' "https://$LB_HOST")
      
      if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "LoadBalancer is returning HTTP 200 status code. Ready for requests."
        # Output to GitHub Actions' GITHUB_OUTPUT
        echo "lb_host=$LB_HOST" >> "$GITHUB_OUTPUT"
        exit 0
      else
        echo "Attempt $j/$RETRIES: HTTP status code $HTTP_STATUS. Retrying in $SLEEP_INTERVAL seconds..."
        sleep "$SLEEP_INTERVAL"
      fi
    done

    # Exit if HTTP 200 is not achieved within retries
    echo "Error: LoadBalancer did not return HTTP 200 within the expected time."
    exit 6
  else
    echo "Attempt $i/$RETRIES: LoadBalancer hostname not available. Retrying in $SLEEP_INTERVAL seconds..."
    sleep "$SLEEP_INTERVAL"
  fi
done

# Final error message if hostname was not obtained within the retries
echo "Error: LoadBalancer hostname was not assigned within the expected time after $RETRIES attempts."
exit 5
