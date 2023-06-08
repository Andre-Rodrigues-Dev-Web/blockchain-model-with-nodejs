const { Blockchain } = require("./blockchain");

const blockchain = new Blockchain();

// Criando algumas transações
blockchain.createTransaction({ from: "Alice", to: "Bob", amount: 50 });
blockchain.createTransaction({ from: "Bob", to: "Alice", amount: 20 });

console.log("\nIniciando a mineração...");
blockchain.minePendingTransactions("miner-address");

console.log(
  "\nBalance de Alice: " + blockchain.getBalanceOfAddress("Alice")
);
console.log("Balance de Bob: " + blockchain.getBalanceOfAddress("Bob"));
console.log(
  "Balance do minerador: " +
    blockchain.getBalanceOfAddress("miner-address")
);
