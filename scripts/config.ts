import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import fs from "fs";
import * as anchor from "@project-serum/anchor";
import { Soliage } from "../target/types/soliage";
import { Program } from "@project-serum/anchor";

anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.Soliage as Program<Soliage>;
const connection = anchor.getProvider().connection;
const userWallet = anchor.AnchorProvider.local().wallet;

interface Record {
    id: number;
    mintAddress: string;
    tokenAccount: string;
    owner: string;
  }
  
const readJsonFile = (filePath: string): Record[] => {
    const data = fs.readFileSync(filePath, { encoding: 'utf8' });
    return JSON.parse(data);
};

const records = readJsonFile('./data/tokens.json');

// for testing, we only need one NFT
const nftMintAddress = new anchor.web3.PublicKey(records[0].mintAddress);


const randomPayer = async (lamports = LAMPORTS_PER_SOL) => {
    const wallet = Keypair.generate();
    const signature = await connection.requestAirdrop(wallet.publicKey, lamports);
    await connection.confirmTransaction(signature);
    return wallet;
}


const findCotMintAuthorityPDA = async (): Promise<[PublicKey, number]> => {
    return await getProgramDerivedAddress(cotMintAddress);
}

const getProgramDerivedAddress = async (seed: PublicKey): Promise<[PublicKey, number]> => {
    return await PublicKey.findProgramAddress(
        [seed.toBuffer()],
        program.programId
    );
}


// @ts-ignore
const cotData = JSON.parse(fs.readFileSync(".keys/cot_mint.json"));
const cotMintKeypair = Keypair.fromSecretKey(new Uint8Array(cotData))
const cotMintAddress = cotMintKeypair.publicKey;



export {
    program,
    connection,
    userWallet,
    randomPayer,
    cotMintKeypair,
    cotMintAddress,
    findCotMintAuthorityPDA,
    nftMintAddress,
}