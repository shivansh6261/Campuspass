first i have build landing page with some events on it  and login register page 
authentication 
For student login/register
install neon postgresql
```
  npm i -g neon@latest && neon login

  neon init -y --org-id org-broad-firefly-90828579 --project-id nameless-king-12501962 --branch production --services postgres

  neon env pull --service postgres

  ```

Authorise it 

now download prisma 
```
npm install @prisma/client@6 

npm install -D prisma@6
```
now initialize prisma

``` 
npx prisma init --datasource-provider postgresql

```
Now .env file is created so 
replace your Database url in it 

validate prisma 
```
npx prisma validate 

```

```
npx prisma migrate dev --name init_students


```
This command will:
1. Read schema.prisma.
2. Compare it with the database structure.
3. Create a migration file.
4. Apply the migration to PostgreSQL.
5. Generate Prisma Client.

Now install two packages:
``` 
npm install bcryptjs zod
```

Create the folders:
```
mkdir -p src/app/api/auth/register 
```

create route.js 
 npm run dev and test 
 ```
  curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Student",
    "email": "demo.student@example.com",
    "enrollment": "DEMO2026001",
    "phone": "9876543210",
    "department": "Computer Science",
    "year": "4th Year",
    "password": "DemoPassword123!",
    "confirmPassword": "DemoPassword123!"
  }'

  ```