const { spawn } = require("child_process");

const command = "npm";
const args = [
  "run",
  "services:up",
  "&&",
  "npm",
  "run",
  "services:wait:database",
  "&&",
  "npm",
  "run",
  "migrations:up",
  "&&",
  "next",
  "dev",
];

const child = spawn(command, args, { stdio: "inherit", shell: true });

// Captura o Ctrl+C (SIGINT) e encerra corretamente
process.on("SIGINT", () => {
  console.log("\nEncerrando servidor Next.js...");
  child.kill("SIGINT"); // Encerra o processo filho corretamente

  // Executa o `postdev` manualmente
  const stopServices = spawn("npm", ["run", "services:stop"], {
    stdio: "inherit",
  });

  stopServices.on("close", () => {
    console.log("Next.js foi encerrado corretamente");
    process.exit(0); // Sai com código 0 para evitar erro
  });
});
