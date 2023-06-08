const { Blockchain, Transaction } = require("./blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const blockchain = new Blockchain();

// Geração de chaves
const key1 = ec.genKeyPair();
const key2 = ec.genKeyPair();

// Endereços das carteiras
const address1 = key1.getPublic("hex");
const address2 = key2.getPublic("hex");

console.log("Address 1: " + address1);
console.log("Address 2: " + address2);

// Criação de transações e assinatura
const transaction1 = new Transaction(address1, address2, 10);
transaction1.signTransaction(key1);

// Adicione as transações pendentes à blockchain
blockchain.createTransaction(transaction1);

console.log("\nIniciando a mineração...");
blockchain.minePendingTransactions("miner-address");

console.log(
  "\nBalance de Address 1: " + blockchain.getBalanceOfAddress(address1)
);
console.log("Balance de Address 2: " + blockchain.getBalanceOfAddress(address2));
console.log(
  "Balance do minerador: " +
    blockchain.getBalanceOfAddress("miner-address")
);
