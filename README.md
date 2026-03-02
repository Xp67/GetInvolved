This is a personal project who aim to build a website where i can sell Event Ticket of my events, i would like also to integrate a project management system with task, to do list and responsive gantt.
i'm also new to programming so feel free to pull advice of every sorts

## Running Locally with Docker Compose

The easiest way to run the entire GetInvolved platform (Backend, Admin Dashboard, Client Web App, and Database) is by using Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Setup

1. Make sure you are in the root directory of the repository.
2. Create a `.env` file in the root directory (you can use `.env.example` if available, or create the necessary environment variables for the backend and database).
3. Run the following command to build the images and start the containers in the background:

```bash
docker-compose up -d --build
```

### Accessing the Applications

Once the containers are up and running, you can access the different parts of the application at the following local addresses:

- **Admin Dashboard** (for event organizers): `http://localhost:3000`
- **Client Web App** (for ticket buyers): `http://localhost:3001`
- **Backend API**: `http://localhost:8080`

### Stopping the Applications

To stop the containers, run:

```bash
docker-compose down
```

If you also want to remove the database volumes (this will delete your local database data!), run:
```bash
docker-compose down -v
```

## Self-Hosting with Cloudflare Tunnels (Zero Trust)

If you want to host GetInvolved on your own VPS/Server and make it accessible from the internet with HTTPS (e.g., `admin.getinvolvd.com`, `www.getinvolvd.com`, `api.getinvolvd.com`) without opening firewall ports, **Cloudflare Tunnels** are the most secure and easiest way.

### Prerequisites
1.  A server (Ubuntu/Debian recommended) with Docker & Docker Compose installed.
2.  A [Cloudflare account](https://dash.cloudflare.com/) with your domain (e.g., `getinvolvd.com`) managed by Cloudflare.

### Steps

1.  **Clone the repository** on your server.
2.  **Configure `.env`**: Make sure your `.env` contains secure passwords and the appropriate API URLs. Your production `VITE_API_URL` should point to `https://api.getinvolvd.com`.
3.  **Start the services locally** on the server:
    ```bash
    docker-compose up -d --build
    ```
4.  **Install `cloudflared`** on your server (or run it as an additional Docker container). If installing directly on Ubuntu:
    ```bash
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    ```
5.  **Authenticate and Create the Tunnel**:
    ```bash
    cloudflared tunnel login
    cloudflared tunnel create getinvolved-tunnel
    ```
6.  **Route the Traffic**: Map your subdomains to the specific local ports you defined in `docker-compose.yml`.
    ```bash
    cloudflared tunnel route dns getinvolved-tunnel api.getinvolvd.com
    cloudflared tunnel route dns getinvolved-tunnel admin.getinvolvd.com
    cloudflared tunnel route dns getinvolved-tunnel www.getinvolvd.com
    ```
7.  **Create the Configuration File**: Create a `config.yml` (usually in `~/.cloudflared/`) pointing the domains to the localhost ports:
    ```yaml
    tunnel: <YOUR-TUNNEL-UUID>
    credentials-file: /root/.cloudflared/<YOUR-TUNNEL-UUID>.json

    ingress:
      - hostname: admin.getinvolvd.com
        service: http://localhost:3000
      - hostname: www.getinvolvd.com
        service: http://localhost:3001
      - hostname: api.getinvolvd.com
        service: http://localhost:8080
      - service: http_status:404
    ```
8.  **Run the Tunnel as a Service**:
    ```bash
    cloudflared tunnel --config ~/.cloudflared/config.yml run getinvolved-tunnel
    ```
    *(Tip: install it as a system service with `sudo cloudflared service install` to make it start automatically on boot).*

Now your platforms are securely accessible from the internet with automatic SSL certificates managed by Cloudflare!
