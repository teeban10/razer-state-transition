import * as readline from "readline";
import * as fs from "fs";
import { handleCommand } from './lib/handleCommand.js';

const processComand = (line: string) => {
  try {
    const output = handleCommand(line);
    // if (output) console.log(output);
  } catch (error: any) {
    console.error('Error processing command:', error.message);
  }
}

const startInterface = () => {
  console.log("\n");
  console.log("\n ================================");
  console.info("Welcome to the Razer Payment Processing CLI, start by entering commands followed by appropriate arguments.");
  console.info("Available commands: CREATE, AUTHORIZE, CAPTURE, VOID, REFUND, SETTLE, SETTLEMENT, STATUS, LIST, AUDIT, EXIT");
  console.info("Enter command (EXIT to quit):");
  const ln = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  ln.setPrompt(">");
  ln.prompt();
  ln.on("line", (input) => {
    if (input === "EXIT") {
      console.log('Goodbye!');
      process.exit(0);
    }
    processComand(input);
    ln.prompt();
  });
}

const fileArg = process.argv[2];

if (fileArg) {
  try {    
    // Check file type if it's a .txt file
    if (fileArg.endsWith(".txt")) { 
      console.log('Loading dataset from file...');
      const fileStream = fs.createReadStream(fileArg);
      const rl = readline.createInterface({ input: fileStream });
      rl.on("line", (line) => {
        processComand(line);
      });
      rl.on("close", () => {
        console.log('Finished processing file. Proceeding with interactive mode.');
        startInterface();
      });
    } else {
      console.log('Invalid file type. Proceeding with interactive mode.');
      startInterface();
    }
  } catch (error: any) {
    console.error('Error reading file:', error.message);
    startInterface();
  }
} else {
  startInterface();
}