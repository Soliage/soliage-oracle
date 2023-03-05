import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";
import { assert } from "chai";
import { Soliage } from "../target/types/soliage";

describe("soliage", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Soliage as Program<Soliage>;
  let pda: anchor.web3.PublicKey;

  it("Is initialized!", async () => {
    const publicKey = anchor.AnchorProvider.local().wallet.publicKey;
    const nft_addressWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const [oraclePDA] =  anchor.web3.PublicKey.findProgramAddressSync([
        utf8.encode('oracle'),
        publicKey.toBuffer(), 
        nft_addressWallet.publicKey.toBuffer()
      ],
      program.programId
    );
    console.log("oraclePDA", oraclePDA);
    await program.methods.createOracle(12, 32000).accounts({
      nftOwner: publicKey,
      nftAddress: nft_addressWallet.publicKey,
      systemProgram:  anchor.web3.SystemProgram.programId,
      oracle: oraclePDA
    }).rpc();
    const oracleAccount = await program.account.oracleAccount.fetch(oraclePDA);
    console.log(oracleAccount);
    assert.equal(oracleAccount.parcelId, 12);
    assert.equal(oracleAccount.amount, 32000);
    assert.isTrue(oracleAccount.nftOwner.equals(publicKey));
    assert.isTrue(oracleAccount.nftAddress.equals(nft_addressWallet.publicKey));
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