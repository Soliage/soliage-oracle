# Oracle Smart Contract (Solana Program)

This first version of the oracle can keep track of the following:

* PublicKey of an NFT representing a land parcel
* An amount representing the quality (percentage forest), with 100% = 1e6
* Parcel Owner (to-do: derive the owner on chain)

We create the keys for minting the Carbon-Offset Token (COT) outside of the code.
Similarly, we rely on the following keys to be available:

* steward_dev: represents the first steward (owner of parcel NFT)
* oracel_dev: represents the first oracle

TO-DO: Support more oracles. Generate consensus number from all oracles.
Incentivise / penalise oracles as needed.

Quickstart:  

`solana-keygen new --outfile .keys/cot_mint.json`

`yarn install`
`anchor build`
`anchor deploy`

Always double-check that when deploying the contract, the generated address shows up in both lib.rs (declare-id) and anchor.toml. If not, change the two files to use the new ID and build / deploy again.

Also, you may have to airdrop 2 SOL to the oracle_dev account if it is not the default wallet 
in solana config



