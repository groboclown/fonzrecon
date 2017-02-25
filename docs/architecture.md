# Architecture

## REST Service

The current REST service has a simple API designed to get a first cut of the
application up and running.

There are two user roles: User and Administrator.  The list of roles is
currently hard-coded.

The REST service stores:

    * List of User - people who have access to the system.
        * Role Assignments
        * Contact IDs (email, Twitter, etc.)
        * Points To Award
        * Received Points Spent - number of points received that the
          user has spent on other things.
    * List of Aaaay Awards
        * Reference User who gave award
        * Reference list of Users who were awarded points
        * Text description
        * Points Awarded
        * Who can view (user or role).

Users with the Administrator role can create users, assign users
to roles, and change Points To Spend for users.

Synthetic values:
  - User Awarded Points: gathered by summing up the list of Aaaay Awards
    received by the user.
  - User Points Given: gathered by summing up the list of Aaaay Awards
    given by the user.

## Bot Interface
