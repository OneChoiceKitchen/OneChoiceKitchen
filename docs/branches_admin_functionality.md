# Branches Management (Admin Panel)

This document provides a detailed, simple-language explanation of all the features available on the **Branches** tab of the Admin Panel (`http://localhost:4205/?tab=branches`).

---

## 1. The Branches Dashboard (Main View)

### What is it?
The main screen when you open the Branches tab. It displays a list of all restaurant branches currently registered in the system.

### Why is it important?
It gives the administrator a quick, bird's-eye view of all operations. You can immediately see how many branches exist, their contact details, their operating status, and whether they are offering delivery or takeaway.

### How it works:
*   **The Table:** Displays branches in rows with their logo, name, associated restaurant brand, contact email/phone, and business hours.
*   **Status Badges:** Colorful labels indicate if a branch is **Active** (green), **Inactive** (yellow), or **Deleted** (red).
*   **Action Buttons:** Each row has a set of buttons (or a dropdown menu) on the right side that lets you edit the branch's details or delete it.

---

## 2. Searching, Filtering, and Pagination

### What is it?
Tools located at the top and bottom of the branches list to help you find specific branches quickly and manage how many you see at once.

### Why is it important?
When the system grows to have dozens or hundreds of branches, scrolling through one massive list becomes impossible. These tools save time and keep the interface clean.

### How it works:
*   **Search Bar:** Type a branch name, city, or address into the search box. The list will instantly update to show only the branches that match your text.
*   **Status Filter:** A dropdown menu that lets you view only "Active" branches, "Inactive" branches, or branches that have been sent to the "Recycle Bin" (Deleted).
*   **Pagination (Bottom):** If you have many branches, they are broken up into pages. You can choose how many branches to see per page (e.g., 10, 20, or 50) and click through the pages using the navigation arrows.

---

## 3. Adding or Editing a Branch

### What is it?
When you click the **"Add Branch"** button or the **"Edit"** icon on a specific branch, a large popup window (modal) appears. This is the command center for configuring a single branch.

### Why is it important?
This is how new business locations are onboarded onto the platform and how existing ones are updated if they change their menu, move to a new location, or change their phone number.

### How it works:
The modal is divided into easy-to-navigate sections on the left sidebar:

*   **Basic Info:**
    *   **What you do here:** Set the branch name and upload the branch's logo. You can also link this branch to an existing parent **Restaurant Brand** or create a brand new one directly from this screen.
    *   **Why it's important:** It establishes the identity of the branch on the customer-facing app.
*   **Location & Contact:**
    *   **What you do here:** Enter the physical address, city, phone number, and email. There is also an interactive **Map Pin** where you can drop a pin to set exact GPS coordinates (Latitude & Longitude).
    *   **Why it's important:** Ensures delivery drivers can find the branch and customers know exactly where their food is coming from.
*   **Options & Settings (Toggles):**
    *   **What you do here:** You will find several switch toggles like:
        *   **Is Active:** Turns the branch entirely on or off on the platform.
        *   **Is Online:** Temporarily stops the branch from receiving orders (e.g., if the kitchen is overwhelmed).
        *   **Is Delivery / Is Takeaway:** Defines how customers can receive their food from this specific branch.
        *   **Is Strictly Halal / Is Veg:** Dietary compliance flags.
    *   **Why it's important:** Gives the restaurant granular, real-time control over their operations without needing a developer to change code.
*   **Discounts & Offers (If applicable):**
    *   **What you do here:** Allows setting a flat discount percentage or an offer text (like "10% off on weekends") that applies to this branch.

---

## 4. Deleting and Restoring Branches (The Recycle Bin)

### What is it?
A safety mechanism for removing branches from the active platform.

### Why is it important?
Accidentally deleting a branch could cause massive data loss (losing all their past orders and menus). Instead of a "hard delete," the system uses a "soft delete."

### How it works:
*   When you click "Delete" on a branch, it doesn't vanish from the database. Instead, it is marked as **"Deleted"** and moved to the Recycle Bin.
*   The branch will no longer appear on the customer app or the main active list.
*   If you change the filter to view "Deleted" branches, you can find the branch and click a **"Restore"** button to instantly bring it back online, fully intact.

---

## Summary of the User Flow

1.  **Administrator logs in** and clicks the "Branches" tab.
2.  They use the **Search** to see if a branch already exists.
3.  If not, they click **"Add Branch"**.
4.  They fill out the **Basic Info**, drop a pin on the **Map** for the location, and upload a **Logo**.
5.  They turn on **Delivery and Takeaway** toggles.
6.  They click **Save**.
7.  The new branch instantly appears in the table with an **Active** green badge, ready to accept orders!
