# Paris Janitor

## Démarrage en local

```bash
git clone https://github.com/Amassi06/paris-janitor.git
cd paris-janitor
cp .env.example .env
```

Remplir le `.env` (laisser `COMPOSE_PROFILES=dev`)

```bash
openssl rand -hex 32     # -> JWT_SECRET
openssl rand -hex 24     # -> MONGO_PASSWORD
```
## Stripe
Clés Stripe en mode test : https://dashboard.stripe.com/test/apikeys
Nécessite le [Stripe CLI](https://docs.stripe.com/stripe-cli).
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copier le whsec_... -> STRIPE_WEBHOOK_SECRET dans .env, puis :
```

```bash
docker compose up -d --build          # démarre tout (1re fois : ~3 min)
docker compose exec api-dev npm run seed   # remplit la base
```

| | |
|---|---|
| Voyageurs | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API / Swagger | http://localhost:3000 · `/api-docs` |

Comptes créés par le seed (mot de passe `Password123`) :

```
admin@paris-janitor.fr        accès back-office
voyageur@paris-janitor.fr     accès espace voyageur
```

Plus 5 prestations dans le catalogue, dont 2 réservées aux abonnés VIP.
