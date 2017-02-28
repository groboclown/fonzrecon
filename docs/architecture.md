# Architecture

## REST Service

The current REST service has a simple API designed to get a first cut of the
application up and running.

There are two user roles: User and Administrator.  The list of roles is
currently hard-coded.

The REST service stores:

    * List of Account - authorization keys for the users.
        * Role Assignments
        * Authorization Email address
        * Reference to User
    * List of User - people who have access to the system.
        * Contact IDs (email, Twitter, etc.)
        * Points Available To give in Aaay Awards.
        * Points Available To Spend on prizes.
    * List of Aaay Awards (acknowledgements)
        * Reference User who gave award
        * Reference list of Users who were awarded points
        * Text description
        * Points Awarded
        * Tags
        * Who can view (user or role).
        * List of "thumbs up" - additional points from others
          who approve of this message.
    * List of prizes one can claim.
    * List of claimed prizes.

Users with the Administrator role can create users, assign users
to roles, and change Points To Spend for users.


## Bot Interface
