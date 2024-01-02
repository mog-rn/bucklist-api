const { exec } = require('child_process');
const readline = require('readline');

const runMigration = (name) => {
    exec(`npx prisma migrate dev --name ${name}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            console.error(`stderr: ${stderr}`); // Print stderr only if there's an error
            return;
        }

        console.log(`stdout: ${stdout}`);
        // stderr is not printed if err is null
    });
};

const args = process.argv.slice(2);

if (args.length > 0) {
    runMigration(args[0]);
} else {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter migration name: ', (name) => {
        runMigration(name);
        rl.close();
    });
}
