# ZA UAT login recovery

The UAT browser could load the frontend but every backend request, including
`/api/login`, returned HTTP 502. Read-only container logs identified two
ambiguous ORM relationships introduced by the owned-cover foreign keys. The
runtime must resume without resetting the database, touching volumes, or
modifying library media.

The implementation scope is limited to declaring the existing owner foreign
keys on the two reverse relationships and restarting only the existing ZA dev
container. Browser navigation remains a separate, non-mutating UAT check.
