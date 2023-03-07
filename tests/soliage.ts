import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";
import { assert } from "chai";
import { Soliage } from "../target/types/soliage";
import fs from "fs";

// @ts-ignore
const parcelData = JSON.parse(fs.readFileSync(".keys/steward_dev.json"));
const steward = anchor.web3.Keypair.fromSecretKey(new Uint8Array(parcelData)).publicKey;
const nftMintAddress = new anchor.web3.PublicKey("25PCHCQxv4cdkRFVrkKbcA6FSZr86ca3rxwDtcUJwwDG");

describe("soliage", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Soliage as Program<Soliage>;
  let pda: anchor.web3.PublicKey;

  it("Is initialized!", async () => {
    const publicKey = anchor.AnchorProvider.local().wallet.publicKey;
    const [oraclePDA] =  anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('oracle'),
        nftMintAddress.toBuffer()
      ],
      program.programId
    );
    console.log("oraclePDA", oraclePDA);
    await program.methods.createOracle(12, 32000).accounts({
      nftOwner: steward,
      oracleProvider: publicKey,
      nftAddress: nftMintAddress,
      systemProgram:  anchor.web3.SystemProgram.programId,
      oracle: oraclePDA
    }).rpc();
    const oracleAccount = await program.account.oracleAccount.fetch(oraclePDA);
    console.log(oracleAccount);
    assert.equal(oracleAccount.parcelId, 12);
    assert.equal(oracleAccount.amount, 32000);
    assert.isTrue(oracleAccount.nftOwner.equals(steward));
    assert.isTrue(oracleAccount.nftAddress.equals(nftMintAddress))
    pda = oraclePDA;
  });

  it("Is updated!", async () => {
    console.log("oraclePDA", pda);
    await program.methods.update(12, 32006).accounts({
      oracle: pda
    }).rpc();
    const oracleAccount = await program.account.oracleAccount.fetch(pda);
    console.log(oracleAccount);
    assert.equal(oracleAccount.amount, 32006);
  });


});