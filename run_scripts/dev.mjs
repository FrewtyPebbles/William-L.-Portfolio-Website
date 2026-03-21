import { run } from "./lib.mjs";
import { execSync } from "child_process";


// 1. Cleanup & Start
run('docker kill temp-db', true);
run('docker rm temp-db', true);

// Start with a healthcheck so we can monitor it
run('docker run --name temp-db ' +
    '-e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=portfoliodb ' +
    '--health-cmd "pg_isready -U user -d portfoliodb" ' +
    '--health-interval 1s --health-retries 10 ' +
    '-p 5432:5432 -d postgres');

// 2. BLOCKING WAIT
console.log('Waiting for database to be healthy...');
while (true) {
  try {
    const status = execSync('docker inspect --format="{{.State.Health.Status}}" temp-db')
      .toString().trim();
    
    if (status === 'healthy') {
      console.log('Database is ready!');
      break; 
    }
  } catch (e) {
    // If inspect fails (container still starting), just wait
  }
  // Simple synchronous sleep (1 second)
  execSync('node -e "setTimeout(()=>{}, 1000)"'); 
}

// 3. Continue with Prisma & Next
try {
  run('npx prisma db push');
  run('next dev');
} finally {
  console.log('\nCleaning up...');
  run('docker kill temp-db', true);
  run('docker rm temp-db', true);
}
