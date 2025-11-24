This is a personal project who aim to build a website where i can sell Event Ticket of my events, i would like also to integrate a project management system with task, to do list and responsive gantt.
i'm also new to programming so feel free to pull advice of every sorts

## Deploying the frontend to Cloud Run

The `frontend` directory now includes a production-ready `Dockerfile` built on Node 20. You can build and deploy it with
Google Cloud Run using the following commands (from the repository root):

```bash
cd frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/getinvolved-frontend
gcloud run deploy getinvolved-frontend \
  --image gcr.io/PROJECT_ID/getinvolved-frontend \
  --platform managed \
  --allow-unauthenticated \
  --region REGION \
  --set-env-vars VITE_API_URL=https://your-backend-url
```

Cloud Run expects applications to listen on port `8080`, which the provided container does automatically.
