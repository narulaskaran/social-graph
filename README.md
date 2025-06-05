# Social Graph Visualization Web App — Product Requirements Document (PRD)

## Project Overview

Build a web application for visualizing social connections as an interactive undirected graph. The app enables users to explore the entire social network without authentication and allows anyone to add themselves and their connections to the network.

---

## Tech Stack

- **Frontend:** TypeScript, React, [shadcn/ui](https://ui.shadcn.com/) components, Tailwind CSS
- **Backend:** Vercel serverless functions
- **Database:** Neon (PostgreSQL), connected via Vercel
- **Deployment:** Vercel (import from GitHub), with local development using `vercel dev` and a configured `vercel.json` file

---

## Core Features

- **Graph Visualization:**  
  The main page displays the social network as an interactive, undirected graph. Each node represents a person, and each edge represents a mutual connection (symmetric tie) between two people. The graph is not overlayed on a map, but rather visualized using a graph library.

- **Public Access:**  
  Users can view the entire graph without logging in.

- **Add to Network:**  
  A button labeled "Add to the network" is fixed at the top right. Clicking it opens a modal.

  - In the modal:
    - Users must provide the LinkedIn profile URL, first name, and last name for themselves.
    - Below, users can enter LinkedIn URLs, first names, and last names for up to three people they know. A "+" button allows adding more input fields. A "Submit" button sends all entered profiles and connections to the backend.
    - The backend checks if each LinkedIn URL already exists in the `Profile` table:
      - If yes, do not create a duplicate entry.
      - If no, create a new profile with the provided data.
    - Each connection is stored as an undirected edge (symmetric tie) between two profiles in the graph.

- **Database Schema:**
  - **Profile Table**
    - `linkedin_url` (Primary Key)
    - `first_name`
    - `last_name`
    - (Optional: `photo_url`, `job_title`, `location`, `last_refreshed`, `staleness_timestamp` for future enrichment)
  - **Connections Table**
    - Stores pairs of LinkedIn URLs representing undirected edges between profiles.

---

## Deployment & Local Development

- The project is deployed to Vercel by importing the GitHub repository.
- The `vercel.json` config file is set up to allow running and testing locally with the `vercel dev` command.

---

## Additional Notes

- The social graph is modeled as an **undirected graph** to represent symmetric relationships (e.g., mutual acquaintance or friendship). This means if person A lists person B as a connection, it is assumed person B is also connected to person A, and only one edge is created between them[1][2][3].
- Consider using a graph visualization library such as [D3.js](https://d3js.org/), [Vis.js](https://visjs.org/), or [Force Graph](https://github.com/vasturiano/force-graph) for rendering the network.
- Ensure the UI is responsive and accessible across devices.
- No profile data is fetched or scraped from LinkedIn; all information is user-provided.

---

# Social Graph

Social network without the features

## Project Setup

1. Clone the repository.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your Neon database credentials:

   ```env
   DATABASE_URL=your_neon_connection_string
   ```

## Run

```sh
npm install && npm run build && npm start
```

## Testing

- Tests are run automatically on push and PR via GitHub Actions.
- To run tests locally:
  - `npm run test`

## Refactor Note

- As of [refactor log in CURSOR.md], all code is now in the project root per Vercel best practices.
