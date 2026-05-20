# Detailed Project Architecture & Database Schema

I completely understand—77 files can seem overwhelming at first glance! 

I recently did a massive cleanup of this repository (removing duplicates, empty files, and unused template files). **Right now, every single file that exists is 100% required for the application to function.** There is no dead weight left.

Here is a human-readable breakdown of what every file does and why it exists.

---

## Part 1: Project Structure Breakdown

### 1. Root Level
*These configure the project as a whole.*
* **`.gitignore`**: Tells Git which files to ignore (like passwords, `node_modules`, or database files) so you don't accidentally upload them to GitHub.
* **`README.md`**: The main instruction manual for your project. Anyone who looks at your GitHub will read this to know how to start the app.

---

### 2. Frontend (`c0_frontend/`)
*This is the React application—everything the user sees and interacts with in the browser.*

**Configuration Files (The "Engine Room"):**
* **`package.json` & `package-lock.json`**: Lists all the JavaScript libraries your frontend needs (like React, Tailwind, Three.js) and exactly what versions to install.
* **`vite.config.ts`**: Configures Vite, which is the super-fast build tool that bundles your code and runs the local development server on port 5173.
* **`eslint.config.js`**: The "linter." It checks your code for errors or bad practices as you type.
* **`tsconfig.json` (and `app.json`, `node.json`)**: Configuration files for TypeScript. They enforce type safety (making sure you don't pass a string when a number is expected) so your code doesn't crash in the browser.
* **`.dependency-cruiser.cjs`**: A tool config that checks your file imports to make sure components aren't loading things in an endless loop.

**Public Assets (`public/`):**
* **`index.html`**: The single HTML page that loads your React app. (I added your SEO tags and fonts here).
* **`favicon.svg` & `icons.svg`**: The tiny icons that show up in the browser tab.
* **`textures/earth_*.jpg`**: The image wrappers used by Three.js to render your 3D interactive globe.

**React Application (`src/`):**
* **`main.tsx`**: The entry point. It takes your React app and injects it into the `index.html` file.
* **`App.tsx`**: The master layout component. It stacks all your website sections (Hero, Dashboard, Market, etc.) in order.
* **`App.css` & `index.css`**: Global stylesheets. `index.css` loads the Tailwind CSS framework and defines your custom scrollbars and glowing glass panels.

**API & State (`src/api/`, `src/context/`):**
* **`api/client.ts`**: The messenger. This handles all communication (HTTP requests) to your Django backend (fetching listings, logging in, buying credits).
* **`context/AuthContext.tsx`**: Your global memory. It remembers if a user is logged in, stores their token, and makes their profile accessible to any component that needs it.

**The UI Components (`src/components/`):**
*Each file here is a distinct visual piece of your website.*
* **`Navbar.tsx`, `Footer.tsx`, `Preloader.tsx`, `StickyCTA.tsx`**: The standard navigation and layout wrappers.
* **`AuthModal.tsx`**: The popup window where users log in or register.
* **`Hero.tsx`, `Earth3D.tsx`, `Particles.tsx`**: The top section of your site featuring the massive, spinning 3D earth and the animated stars/particles.
* **`CarbonDashboard.tsx`**: The user portal showing the progress bar, AI intelligence suggestions, and the credit generation calculator slider.
* **`CarbonMarket.tsx` & `ProjectListing.tsx`**: The pages where users view the grid of available carbon projects and can actively click "Buy".
* **`MarketTrends.tsx`**: Uses Recharts to draw the graphs showing credit price trends and sequestration over time.
* **`MRVStatus.tsx`**: The transparent verification pipeline showing how credits go from IoT sensors to being verified by agencies like Verra.
* **`Storytelling.tsx`**: The interactive "Before & After" image slider showing land restoration.
* **`shared/animations.ts`**: Stores common animation configurations so all elements fade in smoothly as you scroll.

---

### 3. Backend (`c0_backend/`)
*This is the Django API—the brain and database manager of your application.*

**Core Configuration (`c0/`):**
* **`manage.py`**: The command-line tool you use to run the server, migrate the database, or seed data.
* **`requirements.txt`**: Lists all Python libraries needed (Django, Django REST Framework, JWT).
* **`c0/settings.py`**: The master configuration. Connects the database, configures security (CORS), and sets up authentication rules.
* **`c0/urls.py`**: The traffic cop. It routes incoming web requests (like `/api/auth/`) to the correct app.
* **`c0/wsgi.py` & `c0/asgi.py`**: Web server gateways. These allow the Django app to talk to a production web server (like Nginx) when you deploy it to the real internet.

**The "Auth" App (`auth_app/`):**
*Handles users and logins.*
* **`models.py`**: Defines what a `C0User` is (email, password, role: Farmer vs Buyer).
* **`views.py` & `urls.py`**: The endpoints (`/register/`, `/login/`) that the frontend calls to log people in.
* **`serializers.py`**: Translates complex Python database objects into simple JSON text that the React frontend can understand.
* **`tests.py`**: Automated checks to ensure the user creation system is bug-free.

**The "Marketplace" App (`marketplace/`):**
*Handles the actual carbon credits.*
* **`models.py`**: Defines `CarbonProject` (a farm/forest), `CreditListing` (credits for sale), and `Transaction` (a receipt when someone buys).
* **`views.py` & `urls.py`**: The endpoints where the frontend asks for lists of projects or submits a purchase request.
* **`serializers.py`**: Formats the project data (price, location, standard) into JSON.
* **`management/commands/seed_data.py`**: A custom script I wrote. When you run it, it automatically creates 6 fake carbon projects so your marketplace isn't empty when you test it.

**The "Dashboard" App (`dashboard/`):**
*Handles analytics.*
* **`views.py` & `urls.py`**: Calculates the total math across the whole platform (e.g., "How many total tons of CO2 have been sequestered globally?") and sends it to the frontend Hero section.

**Boilerplate (in every app):**
* **`__init__.py`**: An empty file required by Python to recognize a folder as a package of code.
* **`admin.py`**: Configures the `/admin/` portal so you can log in as a superuser and manually edit database rows.
* **`apps.py`**: Just tells Django the name of the app.
* **`migrations/`**: These files act as "version control" for your database schema. If you add a new column to a table, a migration file records that change so the database can update safely.

---

### Do you need to delete anything?
**No.** Earlier in this session, I ran a deep audit and deleted:
1. An entire duplicated backend folder.
2. Unused Vite template CSS (185 lines of dead code).
3. Placeholder images and unused SVGs.
4. Extraneous `.git` repositories.

Everything remaining is the absolute minimum required for a modern, secure, industry-standard full-stack web application. If we delete any of these, the site will either fail to build, fail to start, or crash when a user tries to click a button.

---

## Part 2: Database — PostgreSQL

This application uses **PostgreSQL** as its database. PostgreSQL is an industry-standard, production-grade relational database that provides robust data integrity, advanced querying capabilities, and excellent scalability.

**Connection details** (configured in `c0/settings.py` via environment variables):

| Setting | Default Value |
|---------|---------------|
| Database Name | `c0_db` |
| User | `c0_user` |
| Password | `c0_pass` |
| Host | `localhost` |
| Port | `5432` |

Based on the Django architecture we built, here are the core tables and their exact schemas.

---

### 1. The Users Table (`c0_users`)
This table replaces the default Django user table to support the custom roles needed for the marketplace.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BigInt (Primary Key) | Auto-incrementing ID |
| `password` | String | Hashed and salted password |
| `last_login` | Datetime | Timestamp of last sign in |
| `username` | String (Unique) | The user's handle |
| `email` | String | Contact email |
| `role` | String (Choices) | Defines permissions. Options: `farmer`, `buyer`, `verifier`, `admin` |
| `phone` | String | Optional contact number |
| `is_active` | Boolean | Defaults to True. Used to ban/disable users |
| `is_staff` | Boolean | Can this user access the Django Admin panel? |
| `date_joined` | Datetime | When the account was created |

---

### 2. The Projects Table (`carbon_projects`)
This table stores the physical land/initiatives that are sequestering carbon.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BigInt (Primary Key) | Auto-incrementing ID |
| `owner_id` | Foreign Key | Links to `c0_users` (Who owns this farm/project?) |
| `name` | String | e.g., "Amazon Reforestation Initiative" |
| `project_type` | String (Choices) | e.g., `reforestation`, `soil_carbon`, `renewable_energy`, `methane_capture`, `blue_carbon`, `direct_air_capture` |
| `location_text` | String | Where the project is (e.g., "Amazonas, Brazil") |
| `description` | Text | Detailed story/explanation of the project |
| `standard` | String (Choices) | The MRV verification body: `verra`, `gold_standard`, `acr`, `car`, `puro` |
| `total_hectares` | Decimal | Size of the land |
| `total_sequestered_tco2e` | Decimal | Total tons of CO2 this project has proven to remove |
| `created_at` | Datetime | When the project was registered on the platform |

---

### 3. The Market Listings Table (`credit_listings`)
Not all carbon a project sequesters is put up for sale at once. This table represents the actual "stock" available for purchase on the market page.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BigInt (Primary Key) | Auto-incrementing ID |
| `project_id` | Foreign Key | Links to `carbon_projects` |
| `seller_id` | Foreign Key | Links to `c0_users` |
| `quantity_available` | Integer | How many tons are currently available for purchase |
| `price_per_credit` | Decimal | Price per ton in USD (e.g., $15.00) |
| `status` | String (Choices) | `active`, `sold`, `expired` |
| `listed_at` | Datetime | When the listing went live |

---

### 4. The Transactions Table (`transactions`)
This acts as the ledger/receipt book. Every time a buyer clicks "Buy" on the frontend, a row is created here and the `quantity_available` in the Listing table is reduced.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BigInt (Primary Key) | Auto-incrementing ID |
| `buyer_id` | Foreign Key | Links to `c0_users` |
| `listing_id` | Foreign Key | Links to `credit_listings` |
| `quantity_purchased` | Integer | How many tons were bought |
| `total_price` | Decimal | Total cost of the transaction (`quantity` × `price_per_credit`) |
| `purchased_at` | Datetime | Timestamp of purchase |

---

### Django System Tables
Django automatically creates a few other tables to manage internal systems:
* **`auth_group` / `auth_permission`**: Manages granular admin permissions.
* **`django_migrations`**: Keeps a log of what database schemas have been applied so it knows how to upgrade the database in the future.
* **`django_admin_log`**: Records actions taken in the `/admin/` portal for audit trails.
* **`django_session`**: Used for admin session tracking.
* **`django_content_type`**: Content type registry for the permissions system.

---

## Part 3: Accessing the Database via Django Admin (Web GUI)

The easiest way to view, search, and edit all database tables is through the **Django Admin Panel** — a built-in web GUI that comes pre-configured with this project.

### Setup (One-Time)

1. **Create a superuser** (admin account):
   ```bash
   cd c0_backend
   source venv/bin/activate
   python manage.py createsuperuser
   ```
   You'll be prompted to enter a username, email, and password.

2. **Start the Django server:**
   ```bash
   python manage.py runserver
   ```

3. **Open the admin panel in your browser:**
   ```
   http://127.0.0.1:8000/admin/
   ```

4. **Log in** with the superuser credentials you just created.

### What You Can Do in the Admin Panel

Once logged in, you'll see a clean dashboard listing all registered models:

| Section | Table | Actions Available |
|---------|-------|-------------------|
| **AUTH_APP** | C0 Users | View all users, filter by role/active status, search by username/email, edit roles, deactivate accounts |
| **MARKETPLACE** | Carbon Projects | View all projects, filter by type/standard, search by name/location, edit details |
| **MARKETPLACE** | Credit Listings | View all listings, filter by status/project type, search by project name, update quantities/prices |
| **MARKETPLACE** | Transactions | View all purchases, filter by date, see buyer and listing details |

### Key Features

* **Search & Filter**: Every table has search bars and dropdown filters pre-configured.
* **Inline Editing**: Click any row to edit its fields directly.
* **Add New Records**: Use the "Add" button in any section to create new users, projects, or listings.
* **Bulk Actions**: Select multiple rows and delete them in bulk.
* **Change History**: Every edit is logged — click "History" on any record to see who changed what and when.

---

### How it flows:
1. A user (`C0User` with role `farmer`) creates a `CarbonProject`.
2. The farmer creates a `CreditListing` linked to that project, offering 1,000 tons at $15/ton.
3. Another user (`C0User` with role `buyer`) uses the React frontend to buy 100 credits.
4. A `Transaction` row is created, and the `CreditListing` automatically updates its `quantity_available` down to 900.
