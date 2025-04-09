# Graph Visualization Application

A full-stack Rust application for visualizing graphs (nodes and edges) with customizable layout algorithms.

## Features

- Visualize graphs with nodes and edges
- Apply different layout algorithms (fCoSE, CoSE Bilkent, CiSE, Concentric)
- Customize visualization options
- Store and retrieve graphs
- Cross-platform support (desktop and web)

## Project Structure

The project is organized as a Rust workspace with multiple crates:

```
graph-viz/
├── Cargo.toml                 # Workspace configuration
├── shared/                    # Shared library crate
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs             # Library entry point
│       ├── types.rs           # Core data structures
│       ├── schema.rs          # API schemas
│       └── api.rs             # API contracts
├── frontend/                  # EGUI frontend crate
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs            # Application entry point
│       ├── ui/                # UI components
│       │   └── mod.rs
│       ├── renderer/          # Graph rendering
│       │   └── mod.rs
│       └── layout/            # Layout algorithms
│           └── mod.rs
└── backend/                   # Backend server crate
    ├── Cargo.toml
    └── src/
        ├── main.rs            # Server entry point
        ├── storage/           # Storage abstractions
        │   ├── mod.rs
        │   ├── memory.rs      # In-memory implementation
        │   └── traits.rs      # Storage traits
        └── handlers/          # API handlers
            ├── mod.rs
            └── graph.rs
```

The root `Cargo.toml` defines a workspace that includes the three main crates: `shared`, `frontend`, and `backend`. This structure allows for code sharing between crates while maintaining separation of concerns.

### Workspace Structure

A Rust workspace is a collection of packages that share the same `target/` directory and dependencies. This allows for more efficient compilation and better organization of related packages. In this project:

- The `shared` crate contains common data structures and API definitions used by both frontend and backend
- The `frontend` crate implements the user interface using EGUI
- The `backend` crate implements the server using Axum

Each crate has its own `Cargo.toml` file that defines its dependencies, while the root `Cargo.toml` file defines the workspace structure.

## Development Environment

This project includes a Docker Compose setup for development with auto-reloading.

### Prerequisites

- Docker
- Docker Compose

### Rust Version

The Dockerfiles use Rust 1.81.0, which is compatible with all the dependencies used in the project. We use specific versions of some Cargo tools to ensure compatibility:

- cargo-watch@8.4.0
- basic-http-server@0.8.0

These versions are known to work well with the project. If you encounter any issues related to Rust version compatibility when building the Docker images, you may need to:

1. Use different versions of the tools
2. Update the Rust version in the Dockerfiles
3. Use the `--locked` flag for additional Cargo installations

We've also made the following changes to ensure the code works correctly:

1. Fixed naming conflicts in the shared API module
2. Removed unused imports
3. Added rand dependency to all crates for random positions in layout algorithms
4. Used a specific prerelease version of egui_plot (0.26.0-alpha.2) as there's no stable 0.22 version available

### Running the Development Environment

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd graph-viz
   ```

2. Install go-task:
   - On macOS: `brew install go-task/tap/go-task`
   - On Linux: `sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b ~/.local/bin`
   - On Windows: `choco install go-task`
   - Or see [taskfile.dev](https://taskfile.dev/installation/) for other installation methods

3. Start the development environment:
   ```bash
   task start
   ```

This will start three services:

- **backend**: The backend server running on http://localhost:3000
- **frontend-desktop**: The desktop version of the frontend (for development)
- **frontend-web**: The web version of the frontend running on http://localhost:8080

### Using Task Commands

The `Taskfile.yml` provides several commands to manage the development environment:

```bash
# List all available tasks
task

# Start all services in detached mode
task start

# Start all services with logs
task dev

# Stop all services
task stop

# Restart all services
task restart

# Start only the backend
task backend

# Start only the web frontend
task web

# Start only the desktop frontend
task desktop

# Show logs from all services
task logs

# Rebuild all services
task build

# Remove all containers and volumes
task clean

# Build the desktop application
task build-desktop

# Build the web application
task build-web

# Run all tests
task test

# Run linting checks
task lint
```

### Auto-Reloading

The development environment is configured to automatically reload when files change:

- Backend: Changes to files in `shared/src` or `backend/src` will trigger a rebuild and restart
- Frontend Desktop: Changes to files in `shared/src` or `frontend/src` will trigger a rebuild and restart
- Frontend Web: Changes to files in `shared/src` or `frontend/src` will trigger a rebuild

### Development Workflow

1. Make changes to the code
2. The services will automatically rebuild and restart
3. View the changes in the browser (for web) or in the desktop application

### Running Individual Services

You can also run individual services:

```bash
# Run only the backend
task backend

# Run only the web frontend
task web

# Run only the desktop frontend
task desktop
```

## Building for Production

### Desktop Application

```bash
task build-desktop
```

The executable will be in `target/release/frontend`.

### Web Application

#### Using Task

```bash
task build-web
```

The web application will be in the `dist` directory.

#### Using Trunk Directly

You can also build the web application directly using Trunk:

```bash
# Install Trunk if you haven't already
cargo install trunk

# Install the WebAssembly target
rustup target add wasm32-unknown-unknown

# Build the web application
cd frontend
trunk build --release
```

The built files will be in the `frontend/dist` directory.

## GitHub Pages Deployment

This project is configured to automatically deploy the web frontend to GitHub Pages when changes are pushed to the main branch. The deployment is handled by a GitHub Actions workflow defined in `.github/workflows/deploy-web.yml`.

### Viewing the Deployed Application

The web application is deployed to: https://ocasazza.github.io/kbg/

### Manual Deployment

You can also manually trigger the deployment workflow from the GitHub Actions tab in the repository.

### Local Testing of the Web Build

To test the web build locally before deployment:

```bash
cd frontend
trunk serve --release
```

This will start a local server at http://localhost:8080 serving the web application.

## Academic Papers
Graphviz Papers
---------------
- [Graphviz and Dynagraph - Static and Dynamic Graph Drawing Tools](https://graphviz.org/documentation/EGKNW03.pdf) - a condensed overview ([cite](https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.96.3776))
- [An open graph visualization system and its applications to software engineering](https://graphviz.org/documentation/GN99.pdf) - longer overview, preferred for citation ([cite](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.106.5621))
- [Graph Drawing by Stress Majorization](https://graphviz.org/documentation/GKN04.pdf) - an improved algorithm for neato ([cite](https://link.springer.com/chapter/10.1007/978-3-540-31843-9_25))
- [Topological Fisheye Views for Visualizing Large Graphs](https://graphviz.org/documentation/GKN04a.pdf) - topological-based distorted views for large graphs
- [A method for drawing directed graphs](https://graphviz.org/documentation/TSE93.pdf) - dot's algorithm (1993) ([cite](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.3.8982))
- [Efficient and high quality force-directed graph drawing](http://yifanhu.net/PUB/graph_draw.pdf) - sfdp's algorithm (2005)
- [Improved Circular Layouts](https://graphviz.org/documentation/GK06.pdf) - crossing reduction and edge bundling for circular layouts ([cite](https://link.springer.com/chapter/10.1007/978-3-540-70904-6_37))
- [Efficient and High Quality Force-Directed Graph Drawing](https://graphviz.org/documentation/Hu05.pdf) - the multiscale algorithm used in sfdp ([cite](http://yifanhu.net/PUB/graph_draw.pdf))
- [Implementing a General-Purpose Edge Router](https://graphviz.org/documentation/DGKN97.pdf) - edge routing in Graphviz ([cite](https://link.springer.com/chapter/10.1007/3-540-63938-1_68))
- [Improved Force-Directed Layouts](https://graphviz.org/documentation/GN98.pdf) - Voronoi-based node overlap removal ([cite](https://link.springer.com/chapter/10.1007/3-540-37623-2_28))
- [GMap: Visualizing graphs and clusters as maps](https://graphviz.org/documentation/GHK09.pdf) - displaying graphs as maps ([cite](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.154.8753))
- [Efficient Node Overlap Removal Using a Proximity Stress Model](https://graphviz.org/documentation/GH10.pdf) - Prism node overlap removal ([cite](https://link.springer.com/chapter/10.1007/978-3-642-00219-9_20))
- [On-line Hierarchical Graph Drawing](https://graphviz.org/documentation/NW01.pdf) - dynadag algorithm

Graph Drawing
-------------
- [Wikipedia entry.](http://en.wikipedia.org/wiki/Graph_drawing) They also have a [short article on Graphviz](http://en.wikipedia.org/wiki/Graphviz).
- [graphdrawing.org](http://www.graphdrawing.org/index.html) - annual symposia, books, data, open problems and more

-   Open Directory Project [Graph Drawing](http://dmoztools.net/Science/Math/Combinatorics/Software/Graph_Drawing/) entry.
- [Survey (Franz Brandenburg talk notes in Powerpoint)](http://www.csse.monash.edu.au/~gfarr/research/GraphDrawing02-Mel.ppt)
- [A Short Note on the History of Graph Drawing](https://www.merl.com/publications/TR2001-49)
- [David Eppstein's Geometry in Action](http://www.ics.uci.edu/~eppstein/gina/gdraw.html), Graph Drawing section
- [Graph Drawing: Algorithms for the Visualization of Graphs](http://www.amazon.com/exec/obidos/tg/detail/-/0133016153/qid=1089229182/sr=8-1/ref=sr_8_xs_ap_i1_xgl14/103-2475216-1750235?v=glance&s=books&n=507846) by Ioannis G. Tollis, Giuseppe Di Battista, Peter Eades, Roberto Tamassia
- [Graph Drawing Software (Mathematics and Visualization)](http://www.amazon.com/exec/obidos/tg/detail/-/3540008810/qid=1089229286/sr=1-3/ref=sr_1_3/103-2475216-1750235?v=glance&s=books) by M. Junger, Petra Mutzel, (Symposium on Graph Drawing 2001, Vienna)
- [Drawing Graphs: Methods and Models](http://www.amazon.com/exec/obidos/tg/detail/-/3540420622/qid=1089229286/sr=1-8/ref=sr_1_8/103-2475216-1750235?v=glance&s=books) by Michael Kaufmann, Dorothea Wagner
- [Handbook of Graph Drawing and Visualization](http://www.amazon.com/Handbook-Visualization-Discrete-Mathematics-Applications/dp/1584884126%3FSubscriptionId%3DAKIAILSHYYTFIVPWUY6Q%26tag%3Dduckduckgo-d-20%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3D1584884126) Roberto Tamassia, ed. [(On-line version)](http://cs.brown.edu/people/rtamassi/gdhandbook/)

Information Visualization
-------------------------

-   IEEE Infovis Symposia: [current](http://vis.computer.org/), [past](http://www.infovis.org/)

-   [Information Visualization Journal](http://www.palgrave-journals.com/ivs/)

-   [FlowingData](http://flowingdata.com/)

-   [York U. Gallery of Visualization](http://www.datavis.ca/gallery/index.php) (see also [Statistics and Statistical Graphics Resources](http://euclid.psych.yorku.ca/SCS/StatResource.html)).

-   [Stanford University course bibliography](http://graphics.stanford.edu/courses/cs348c-96-fall/resources.html)

-   [Stanford University Data Journalism](http://datajournalism.stanford.edu/)

-   [Xerox PARC projects](http://www2.parc.com/istl/projects/uir/projects/ii.html)

-   [Software Visualization at Georgia Tech](http://www.gvu.gatech.edu/)

**

## License

[MIT License](LICENSE)
