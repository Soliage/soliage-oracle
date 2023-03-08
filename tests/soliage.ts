import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";
import { assert } from "chai";
import { Soliage } from "../target/types/soliage";
import fs from "fs";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  cotMintAddress,
  //parcelMintAddress,
  program,
  findCotMintAuthorityPDA
} from "../scripts/config"
import { User } from "./user";
import { createMints } from "../scripts/create-mints";
import { TokenHelper } from "./token_helper";

// @ts-ignore
const parcelData = JSON.parse(fs.readFileSync(".keys/steward_dev.json"));
const steward = anchor.web3.Keypair.fromSecretKey(new Uint8Array(parcelData)).publicKey;
const nftMintAddress = new anchor.web3.PublicKey("4zQYVjemiCUb9RxENk2g8EncrTm97BND2z4DiDahA3UM");

describe("soliage", () => {
  //anchor.setProvider(anchor.AnchorProvider.env());

  //const program = anchor.workspace.Soliage as Program<Soliage>;
  let pda: anchor.web3.PublicKey;

  before(async () => {
    await createMints();
  });

  it("Is initialized!", async () => {
    // use the wallet configured in anchor.toml as the main wallet
    const publicKey = anchor.AnchorProvider.local().wallet.publicKey;
    // if needed, init a PDA based on the NFT mint address where we store data
    const [oraclePDA] =  anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('oracle'),
        nftMintAddress.toBuffer()
      ],
      program.programId
    );
    console.log("oraclePDA", oraclePDA);
    // call the program to create the storage tx needed
    await program.methods.createOracle(32000).accounts({
      // remember who owns the NFT
      nftOwner: steward,
      // remember which Oracle provided the value
      oracleProvider: publicKey,
      // remember the unique ID of the NFT
      nftAddress: nftMintAddress,
      // for Anchor's validation purposes:
      systemProgram:  anchor.web3.SystemProgram.programId,
      // this of this as the "hash" of the NFT
      oracle: oraclePDA
    }).rpc();

    // now, see if it worked by retrieving the data from the chain
    const oracleAccount = await program.account.oracleAccount.fetch(oraclePDA);
    console.log(oracleAccount);
    const bn = new BN(oracleAccount.timestamp);
    const date = new Date(bn.toNumber()*1e3);
    console.log(`Timestamp: ${date.toISOString()}`);
    assert.equal(oracleAccount.amount, 32000);
    assert.isTrue(oracleAccount.nftOwner.equals(steward));
    assert.isTrue(oracleAccount.nftAddress.equals(nftMintAddress))
    // remember the PDA for the next test
    pda = oraclePDA;
  });

  it("Is updated!", async () => {
    // 0. Prepare Token Bags
    const user =  new User();
    await user.getOrCreateCotTokenBag();

    // 1. Get current stake amount
    const userCots = await user.cotBalance();

    // For the MINT
    const [cotPDA, cotPDABump] = await findCotMintAuthorityPDA();
    // for updating, we pass the new values (as params) and the storage location (PDA - as accounts)
    await program.methods.update(cotPDABump ,32006).accounts({
      oracle: pda,
      // Solana is lost: where are my spl program friends?
      tokenProgram: TOKEN_PROGRAM_ID,

      // **************
      // MINTING 🥩 TO USERS
      // **************
      cotMint: cotMintAddress,
      cotMintAuthority: cotPDA,
      userCotTokenBag: user.cotTokenBag,

    }).rpc();

    // now, see if it worked by retrieving the data from the chain
    const oracleAccount = await program.account.oracleAccount.fetch(pda);
    console.log(oracleAccount);
    assert.equal(oracleAccount.amount, 32006);
  });


});