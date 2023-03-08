import { Keypair, PublicKey } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import {
    cotMintKeypair,
    connection,
    randomPayer,
    findCotMintAuthorityPDA,
} from "./config";


const createMints = async () => {
    // authority for COT is a PDA seeded with the cotMint
    const [cotPDA, _] =  await findCotMintAuthorityPDA();

    const cotMintAddress = await createMintAcct(
        cotMintKeypair,
        cotPDA)

    console.log(`🪙 cot Mint Address: ${cotMintAddress}`);
}



const createMintAcct = async (keypairToAssign: Keypair, authorityToAssign: PublicKey): Promise<PublicKey> => {
    return await createMint(
        connection,
        await randomPayer(),
        authorityToAssign, // mint authority
        null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
        8, // decimals
        keypairToAssign // address of the mint
    );
}


export {
    createMints
}