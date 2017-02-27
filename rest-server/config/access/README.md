# About

The access control uses the *role* associated with the requesting login
to determine whether it can perform the function based on the
role's *permissions*.  Each request limits its access through the
permission category, and the role has a specific access level for each
permission category.

Some login roles (e.g. 'bot') can perform a request on behalf of another user.
