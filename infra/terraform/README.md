# Terraform (not started yet)

Empty on purpose — there's no cloud target yet, so writing Terraform modules
now would mean guessing at a provider/account we don't have. What Phase 0
actually commits to is the constraint that makes this directory possible to
fill in later without a rewrite:

- Everything in this repo runs in Docker (see the root `docker-compose.yml`)
- The only stateful services are Postgres and Redis — both standard, both
  offered as managed services by every major cloud
- All config is environment variables (see `.env.example`), nothing
  hardcoded to a host or provider

When a real cloud target is chosen, this directory gets modules for: a
container runtime (ECS/Cloud Run/AKS-equivalent), a managed Postgres
instance, a managed Redis instance, and object storage — each swappable by
changing the provider block, not the application code.
