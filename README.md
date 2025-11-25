This is a personal project who aim to build a website where i can sell Event Ticket of my events, i would like also to integrate a project management system with task, to do list and responsive gantt.
i'm also new to programming so feel free to pull advice of every sorts

## Deploying the frontend to Cloud Run

The `frontend` directory now includes a production-ready `Dockerfile` built on Node 20. You can build and deploy it with
Google Cloud Run using the following commands (from the repository root):

```bash
cd frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/getinvolved-frontend --build-arg VITE_API_URL=https://your-backend-url
gcloud run deploy getinvolved-frontend \
  --image gcr.io/PROJECT_ID/getinvolved-frontend \
  --platform managed \
  --allow-unauthenticated \
  --region REGION
```

The `VITE_API_URL` build argument is set as an environment variable during `npm run build`, so the production value is baked
into the bundle. Avoid using a local `.env` with a `localhost` URL for production builds; either provide the build argument in
CI/Cloud Build or define a `.env.production` with the correct backend URL.

Cloud Run expects applications to listen on port `8080`, which the provided container does automatically.
