import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare let window: any;

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class Wallet implements OnInit {

  connected: boolean = false;
  account: string = '';
  balance: string = '';
  walletType: string = '';
  availableWallets: string[] = [];
  selectedWallet: string = '';
  recipientAddress: string = '';
  transferAmount: string = '';
  walletApi: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.detectWallets();
  }

  detectWallets() {
    this.availableWallets = [];
    if (window.ethereum) {
      this.availableWallets.push('metamask');
    }
    if (window.cardano) {
      const cardanoWallets = Object.keys(window.cardano).filter(key =>
        typeof window.cardano[key] === 'object' && window.cardano[key] && typeof window.cardano[key].enable === 'function' && window.cardano[key].isEnabled
      );
      this.availableWallets.push(...cardanoWallets);
    }
    if (this.availableWallets.length > 0) {
      this.selectedWallet = this.availableWallets[0];
    }
  }



  async connect(wallet: string) {
    if (wallet === 'metamask') {
      await this.connectMetaMask();
    } else {
      await this.connectCardanoWallet(wallet);
    }
  }

  async connectCardanoWallet(wallet: string) {
    try {
      if (window.cardano && window.cardano[wallet]) {
        const api = await window.cardano[wallet].enable();
        this.walletApi = api;

        let addresses = await api.getUsedAddresses();
        if (addresses.length === 0) {
          addresses = await api.getUnusedAddresses();
        }
        this.account = addresses[0];

        const balance = await api.getBalance();
        this.balance = (parseInt(balance, 16) / 1_000_000) + ' ADA';

        this.walletType = 'cardano';
        this.connected = true;

        this.http.post('http://localhost:8000/api/save-wallet', {
          userId: localStorage.getItem('userId'),
          walletAddress: this.account,
          balance: this.balance
        }).subscribe();

      } else {
        alert(`${wallet} wallet not found. Please install ${wallet}.`);
      }
    } catch (error) {
      console.error(`${wallet} wallet connect error:`, error);
    }
  }

  async connectMetaMask() {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.account = accounts[0];
        const balanceHex = await window.ethereum.request({ method: 'eth_getBalance', params: [this.account, 'latest'] });
        const balanceWei = parseInt(balanceHex, 16);
        this.balance = (balanceWei / 1e18) + ' ETH';
        this.walletType = 'metamask';
        this.connected = true;

        this.http.post('http://localhost:8000/api/save-wallet', {
          userId: localStorage.getItem('userId'),
          walletAddress: this.account,
          balance: this.balance
        }).subscribe();

      } else {
        alert('MetaMask not found. Please install MetaMask.');
      }
    } catch (error) {
      console.error('MetaMask connect error:', error);
    }
  }

  transfer() {
    console.log('Transfer initiated:', {
      walletType: this.walletType,
      recipientAddress: this.recipientAddress,
      transferAmount: this.transferAmount,
      connected: this.connected
    });

    if (!this.recipientAddress || !this.transferAmount) {
      console.error('Validation failed: Missing recipient address or amount');
      alert('Please enter recipient address and amount.');
      return;
    }
    if (this.walletType === 'metamask') {
      if (!this.recipientAddress.startsWith('0x') || this.recipientAddress.length !== 42) {
        console.error('Validation failed: Invalid Ethereum address');
        alert('Invalid Ethereum address. Must be 42 characters starting with 0x.');
        return;
      }
      if (parseFloat(this.transferAmount) <= 0) {
        console.error('Validation failed: Amount not positive');
        alert('Amount must be positive.');
        return;
      }
      console.log('Calling transferMetaMask');
      this.transferMetaMask();
    } else if (this.walletType === 'cardano') {
      // Basic validation for Cardano
      if (this.recipientAddress.length < 50) {
        console.error('Validation failed: Invalid Cardano address');
        alert('Invalid Cardano address. Please check the address.');
        return;
      }
      if (parseFloat(this.transferAmount) <= 0) {
        console.error('Validation failed: Amount not positive');
        alert('Amount must be positive.');
        return;
      }
      console.log('Calling transferCardano');
      this.transferCardano();
    } else {
      console.error('Unknown wallet type:', this.walletType);
      alert('Unsupported wallet type.');
    }
  }

  async transferMetaMask() {
    try {
      const transactionParameters = {
        to: this.recipientAddress,
        from: this.account,
        value: '0x' + (parseFloat(this.transferAmount) * 1e18).toString(16), // Convert ETH to Wei
      };
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      alert(`Transaction sent! Hash: ${txHash}`);
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed.');
    }
  }

  async transferCardano() {
    try {
      if (!this.walletApi) {
        throw new Error('Wallet API not available');
      }

      // Convert amount to lovelace (1 ADA = 1,000,000 lovelace)
      const amountLovelace = Math.floor(parseFloat(this.transferAmount) * 1_000_000);

      // Build transaction
      const tx = {
        outputs: [{
          address: this.recipientAddress,
          amount: amountLovelace
        }],
        metadata: null
      };

      console.log('Building transaction:', tx);

      // Sign and submit transaction
      const signedTx = await this.walletApi.signTx(tx);
      console.log('Signed transaction:', signedTx);

      const txHash = await this.walletApi.submitTx(signedTx);
      console.log('Transaction submitted:', txHash);

      alert(`Cardano transaction sent! Hash: ${txHash}`);
    } catch (error) {
      console.error('Cardano transfer error:', error);
      alert('Cardano transfer failed: ' + (error as Error).message);
    }
  }

  disconnect() {
    console.log('Disconnecting wallet');
    this.connected = false;
    this.account = '';
    this.balance = '';
    this.walletType = '';
    this.walletApi = null;
    this.selectedWallet = '';
    this.recipientAddress = '';
    this.transferAmount = '';
    alert('Wallet disconnected successfully.');
  }
}
