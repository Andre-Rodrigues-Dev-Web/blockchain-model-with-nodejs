const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = Date.now();
    this.signature = "";
  }

  calculateHash() {
    return SHA256(
      this.from + this.to + this.amount + this.timestamp
    ).toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.from) {
      throw new Error("Cannot sign transactions for other wallets!");
    }

    const transactionHash = this.calculateHash();
    const signature = signingKey.sign(transactionHash, "base64");
    this.signature = signature.toDER("hex");
  }

  isValid() {
    if (this.from === null) {
      return true; // Reward transaction for mining
    }

    if (!this.signature || this.signature.length === 0) {
      throw new Error("Transaction has no signature!");
    }

    const publicKey = ec.keyFromPublic(this.from, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = "";
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }

  hasValidTransactions() {
    for (const transaction of this.transactions) {
      if (!transaction.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block("01/01/2023", [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("Block mined successfully!");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }

  createTransaction(transaction) {
    if (!transaction.isValid()) {
      console.log("Transaction is not valid. Discarding...");
      return;
    }
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.from === address) {
          balance -= transaction.amount;
        }

        if (transaction.to === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
    }

    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
