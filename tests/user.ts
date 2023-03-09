import {  PublicKey } from '@solana/web3.js';
import { cotMintAddress, userWallet } from "../scripts/config"
import { TokenHelper } from "./token_helper";
import { Wallet } from "@project-serum/anchor";


class User {
    parcelToken: TokenHelper;
    parcelTokenBag: PublicKey;
    cotToken: TokenHelper;
    cotTokenBag: PublicKey;
    wallet: Wallet;

    constructor(wallet = userWallet) {
        this.cotToken = new TokenHelper(cotMintAddress);
        this.wallet = wallet as Wallet; //check
    }

    getOrCreateParcelTokenBag = async () => {
       this.parcelTokenBag = (await this.parcelToken.getOrCreateTokenBag(this.wallet.publicKey)).address;
    }

    getOrCreateCotTokenBag = async () => {
        this.cotTokenBag = (await this.cotToken.getOrCreateTokenBag(this.wallet.publicKey)).address;
    }

    parcelBalance = async () => {
        // call getOrCreateParcelTokenBag first
        return await this.parcelToken.balance(this.parcelTokenBag);
    }

    cotBalance = async () => {
        // call getOrCreateCotTokenbag first
        return await this.parcelToken.balance(this.cotTokenBag);
    }
}


export {
    User
}